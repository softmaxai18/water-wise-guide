import React, { useState, useEffect, useCallback } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ChartInterface } from '@/components/ChartInterface';
import { TabSystem } from '@/components/TabSystem';
import { WaterHeaterAPI, parseStreamResponse } from '@/services/api';
import { ChatMessage, ChartData, ClickData } from '@/types/waterHeater';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'chart'>('chat');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | undefined>();
  const { toast } = useToast();

  // Initialize conversation on component mount
  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      const response = await WaterHeaterAPI.startConversation();
      const initialMessage: ChatMessage = {
        id: 'initial',
        content: response.message,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the water heater expert. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to initialize conversation:', error);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: messageContent,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create assistant message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      content: '',
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setStreamingMessageId(assistantMessageId);

    try {
      const stream = await WaterHeaterAPI.sendMessage(messageContent);
      
      if (!stream) {
        throw new Error('No response stream');
      }

      await parseStreamResponse(
        stream,
        (content) => {
          // Update the streaming message content
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + content }
              : msg
          ));
        },
        async () => {
          // Stream complete
          setIsLoading(false);
          setStreamingMessageId(undefined);
          
          // Check if chart data is available
          try {
            const newChartData = await WaterHeaterAPI.getChartData();
            setChartData(newChartData);
            
            // Show notification that results are ready
            toast({
              title: "Recommendations Ready! 🎉",
              description: "Your personalized water heater comparison is now available in the Results tab.",
            });
            
            // Auto-switch to chart tab after a brief delay
            setTimeout(() => {
              setActiveTab('chart');
            }, 2000);
            
          } catch (chartError) {
            // Chart data not available yet, that's fine
            console.log('Chart data not ready yet');
          }
        },
        (error) => {
          // Stream error
          setIsLoading(false);
          setStreamingMessageId(undefined);
          toast({
            title: "Error",
            description: error,
            variant: "destructive"
          });
        }
      );

    } catch (error) {
      setIsLoading(false);
      setStreamingMessageId(undefined);
      
      // Remove the empty assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to send message:', error);
    }
  };

  const handleBarClick = useCallback(async (clickData: ClickData) => {
    try {
      await WaterHeaterAPI.logClick(clickData);
      
      // Auto-fill question about the clicked bar
      const question = `Why did ${clickData.system} get ${clickData.score}/5 for ${clickData.metric}?`;
      
      // Add some delay to make the transition smooth
      setTimeout(() => {
        handleSendMessage(question);
      }, 500);
      
    } catch (error) {
      console.error('Failed to log click:', error);
    }
  }, [handleSendMessage]);

  const handleTabChange = (tab: 'chat' | 'chart') => {
    setActiveTab(tab);
  };

  return (
    <main className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-xl text-white">💧</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Water Heater Expert
              </h1>
              <p className="text-sm text-muted-foreground">
                Find your perfect water heating solution
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabSystem
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasChartData={!!chartData}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full rounded-none border-0 shadow-none">
          {activeTab === 'chat' ? (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              streamingMessageId={streamingMessageId}
            />
          ) : (
            <ChartInterface
              data={chartData}
              onBarClick={handleBarClick}
              onSwitchToChat={() => setActiveTab('chat')}
            />
          )}
        </Card>
      </div>
    </main>
  );
};

export default Index;

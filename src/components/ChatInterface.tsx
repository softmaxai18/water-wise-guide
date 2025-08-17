import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/waterHeater';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  streamingMessageId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  streamingMessageId
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-2xl text-white">💧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Water Heater Expert</h3>
              <p className="text-muted-foreground">
                I'll help you find the perfect water heater for your needs
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={isLoading && message.id === streamingMessageId}
              />
            ))}
            {isLoading && !streamingMessageId && (
              <div className="flex justify-start">
                <div className="bg-[hsl(var(--chat-assistant-bg))] border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-[var(--shadow-chat)]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-[hsl(var(--chat-input-bg))] p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about water heaters..."
              className={cn(
                "min-h-[44px] max-h-[120px] resize-none",
                "bg-background border-border rounded-xl",
                "focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-[var(--transition-smooth)]"
              )}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "h-11 px-4 rounded-xl",
              "bg-primary hover:bg-primary/90",
              "transform transition-[var(--transition-spring)]",
              "hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:transform-none"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
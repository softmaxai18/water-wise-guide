import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '@/types/waterHeater';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className={cn(
      "flex w-full mb-4 message-fade-in",
      message.isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 relative",
        "shadow-[var(--shadow-chat)] transition-[var(--transition-smooth)]",
        message.isUser
          ? "bg-[hsl(var(--chat-user-bg))] text-white rounded-br-md"
          : "bg-[hsl(var(--chat-assistant-bg))] text-foreground border border-border rounded-bl-md"
      )}>
        <div className="text-base leading-relaxed prose prose-sm max-w-none [&_strong]:font-bold [&_strong]:text-inherit">
          <ReactMarkdown 
            components={{
              p: ({children}) => <span>{children}</span>,
              strong: ({children}) => <strong className="font-bold">{children}</strong>
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current typing-indicator opacity-75" />
          )}
        </div>
        <div className={cn(
          "text-xs mt-2 opacity-60",
          message.isUser ? "text-white/70" : "text-muted-foreground"
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
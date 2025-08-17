import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabSystemProps {
  activeTab: 'chat' | 'chart';
  onTabChange: (tab: 'chat' | 'chart') => void;
  hasChartData: boolean;
}

export const TabSystem: React.FC<TabSystemProps> = ({
  activeTab,
  onTabChange,
  hasChartData
}) => {
  return (
    <div className="flex border-b border-border bg-background/95 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange('chat')}
        className={cn(
          "flex-1 h-12 rounded-none border-b-2 transition-[var(--transition-smooth)]",
          activeTab === 'chat'
            ? "border-primary bg-primary/5 text-primary font-medium"
            : "border-transparent hover:bg-muted/50"
        )}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Chat</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange('chart')}
        disabled={!hasChartData}
        className={cn(
          "flex-1 h-12 rounded-none border-b-2 transition-[var(--transition-smooth)]",
          activeTab === 'chart' && hasChartData
            ? "border-primary bg-primary/5 text-primary font-medium"
            : "border-transparent hover:bg-muted/50",
          !hasChartData && "opacity-50 cursor-not-allowed"
        )}
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Results</span>
        {hasChartData && (
          <span className="ml-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
        )}
      </Button>
    </div>
  );
};
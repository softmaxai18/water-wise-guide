export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChartData {
  categories: string[];
  heaters: {
    [key: string]: number[];
  };
}

export interface ClickData {
  system: string;
  metric: string;
  score: number;
  index: number;
}

export interface ChatStatus {
  turn_count: number;
  message_count: number;
  is_complete: boolean;
  recommendations_given: boolean;
}
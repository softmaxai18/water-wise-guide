import { ChatMessage, ChartData, ClickData, ChatStatus } from '@/types/waterHeater';

const API_BASE_URL = 'http://localhost:8001';

export class WaterHeaterAPI {
  static async startConversation(): Promise<{ session_id: string; message: string; is_complete: boolean }> {
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }

    return await response.json();
  }

  static async sendMessage(message: string): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.body;
  }

  static async getChartData(): Promise<ChartData> {
    const response = await fetch(`${API_BASE_URL}/chat/chart-data`);

    if (!response.ok) {
      throw new Error('Failed to get chart data');
    }

    return await response.json();
  }

  static async logClick(clickData: ClickData): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/click-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clickData),
    });
  }

  static async getChatStatus(): Promise<ChatStatus> {
    const response = await fetch(`${API_BASE_URL}/chat/status`);

    if (!response.ok) {
      throw new Error('Failed to get chat status');
    }

    return await response.json();
  }

  static async clearLogs(): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/clear-logs`, {
      method: 'POST',
    });
  }
}

export const parseStreamResponse = async (
  stream: ReadableStream<Uint8Array>,
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              onChunk(data.content);
            } else if (data.error) {
              onError(data.error);
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', line);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Stream error');
  } finally {
    reader.releaseLock();
  }
};
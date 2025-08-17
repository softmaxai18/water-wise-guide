import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { ChartData, ClickData } from '@/types/waterHeater';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ChartInterfaceProps {
  data: ChartData | null;
  onBarClick: (clickData: ClickData) => void;
  onSwitchToChat: () => void;
}

export const ChartInterface: React.FC<ChartInterfaceProps> = ({
  data,
  onBarClick,
  onSwitchToChat
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  const heaterColors = {
    'Electric Tank': 'hsl(var(--electric-tank))',
    'Electric Tankless': 'hsl(var(--electric-tankless))',
    'Heat Pump': 'hsl(var(--heat-pump))',
    'Natural Gas Tank': 'hsl(var(--gas-tank))',
    'Natural Gas Tankless': 'hsl(var(--gas-tankless))',
    'Active Solar': 'hsl(var(--solar))'
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        display: false
      },
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: 'bold'
          },
          color: 'hsl(var(--muted-foreground))'
        },
        grid: {
          color: 'hsl(var(--border))'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: 'hsl(var(--foreground))'
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--muted-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            return data?.categories[tooltipItems[0].dataIndex] || '';
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}/5`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && data) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        
        const datasets = Object.keys(data.heaters);
        const system = datasets[datasetIndex];
        const metric = data.categories[dataIndex];
        const score = data.heaters[system][dataIndex];

        const clickData: ClickData = {
          system,
          metric,
          score,
          index: dataIndex
        };

        onBarClick(clickData);
        onSwitchToChat();
      }
    }
  };

  const chartData = data ? {
    labels: data.categories,
    datasets: Object.entries(data.heaters).map(([heaterType, scores]) => ({
      label: heaterType,
      data: scores,
      backgroundColor: heaterColors[heaterType as keyof typeof heaterColors] || 'hsl(var(--primary))',
      borderRadius: 4,
      borderSkipped: false,
    }))
  } : null;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <span className="text-2xl">📊</span>
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Complete the consultation to see your personalized water heater recommendations
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <Card className="h-full chart-hover-scale">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-xl">🏆</span>
            <span>Water Heater Comparison</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any bar to learn more about that system's performance
          </p>
        </CardHeader>
        <CardContent className="h-[calc(100%-120px)]">
          <div className="h-full">
            {chartData && (
              <Bar
                ref={chartRef}
                data={chartData}
                options={chartOptions}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
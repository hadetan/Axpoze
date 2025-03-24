import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Paper, Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ISavingsHistory } from '../../types/savings.types';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ContributionChartProps {
  history: ISavingsHistory[];
  height?: number;
}

const ContributionChart: React.FC<ContributionChartProps> = ({ 
  history,
  height = 300
}) => {
  const theme = useTheme();

  const prepareChartData = () => {
    if (history.length === 0) return { labels: [], values: [] };

    const dates = history.map(item => parseISO(item.date));
    const dateValues = dates.map(date => date.getTime());
    const start = startOfMonth(Math.min(...dateValues));
    const end = endOfMonth(Math.max(...dateValues));

    // Create daily accumulation map
    const dailyMap = new Map<string, number>();
    let runningTotal = 0;

    // Initialize all days with previous running total
    eachDayOfInterval({ start, end }).forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      dailyMap.set(dateStr, runningTotal);
    });

    // Add contributions
    history
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(item => {
        runningTotal += item.amount;
        dailyMap.set(item.date, runningTotal);
      });

    // Convert to arrays for chart
    const sortedEntries = Array.from(dailyMap.entries()).sort();
    return {
      labels: sortedEntries.map(([date]) => format(parseISO(date), 'MMM d')),
      values: sortedEntries.map(([_, value]) => value)
    };
  };

  const { labels, values } = prepareChartData();

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Contribution Growth
        </Typography>
        <Box sx={{ height }}>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Total Contributions',
                  data: values,
                  fill: true,
                  borderColor: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}20`,
                  tension: 0.4,
                  pointRadius: 0,
                  pointHitRadius: 10,
                  pointHoverRadius: 4,
                  pointHoverBorderWidth: 2,
                  pointHoverBackgroundColor: theme.palette.primary.main,
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true
                  }
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    label: (context: TooltipItem<'line'>) => {
                      return `₹${Number(context.raw).toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8
                  }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: theme.palette.divider
                  },
                  ticks: {
                    callback: function(this: any, value: number): string {
                      return `₹${value.toLocaleString()}`;
                    }
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'nearest'
              }
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default ContributionChart;

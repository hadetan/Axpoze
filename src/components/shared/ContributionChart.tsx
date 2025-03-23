import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Box, Paper, Typography, useTheme, Stack, Chip } from '@mui/material';
import { ISavingsHistory, ISavingsMilestone } from '../../types/savings.types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { formatCurrency } from '../../utils/currency';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface ContributionChartProps {
  history: ISavingsHistory[];
  milestones?: ISavingsMilestone[];
  height?: number;
}

const ContributionChart: React.FC<ContributionChartProps> = ({ 
  history,
  milestones = [],
  height = 300 
}) => {
  const theme = useTheme();

  const prepareChartData = () => {
    if (history.length === 0) return { labels: [], values: [] };

    // Get date range
    const dates = history.map(item => parseISO(item.date));
    const start = startOfMonth(Math.min(...dates.map(d => d.getTime())));
    const end = endOfMonth(Math.max(...dates.map(d => d.getTime())));

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

  const data: ChartData<'line'> = {
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
      },
      ...milestones.map((milestone) => ({
        label: `${milestone.title} (${formatCurrency(milestone.target_amount)})`,
        data: Array(labels.length).fill(milestone.target_amount),
        borderColor: milestone.achieved 
          ? theme.palette.success.main 
          : `${theme.palette.warning.main}88`,
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      }))
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          filter: (item) => {
            return item.text?.includes('(₹') || false;
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `₹${context.raw?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          }
        }
      },
      annotation: {
        annotations: milestones
          .filter(m => m.deadline)
          .map(milestone => ({
            type: 'line' as const,
            scaleID: 'x' as const,
            value: format(new Date(milestone.deadline!), 'MMM d'),
            borderColor: milestone.achieved 
              ? theme.palette.success.main 
              : theme.palette.warning.main,
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `${milestone.title} Deadline`,
              position: 'start'
            }
          }))
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
          callback: (value) => `₹${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Contribution Growth
        </Typography>
        <Box sx={{ height }}>
          <Line data={data} options={options} />
        </Box>
        {milestones.length > 0 && (
          <Stack 
            direction="row" 
            spacing={2} 
            flexWrap="wrap" 
            useFlexGap
            sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}
          >
            {milestones.map((milestone) => (
              <Chip
                key={milestone.id}
                label={`${milestone.title}: ${formatCurrency(milestone.target_amount)}`}
                size="small"
                color={milestone.achieved ? 'success' : 'warning'}
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default ContributionChart;

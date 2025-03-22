import React from 'react';
import { Box, useTheme } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ISavingsHistory } from '../../types/savings.types';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/currency';

interface ContributionChartProps {
  history: ISavingsHistory[];
  targetAmount: number;
}

const ContributionChart: React.FC<ContributionChartProps> = ({ history, targetAmount }) => {
  const theme = useTheme();

  const chartData = React.useMemo(() => {
    const data = history
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc: { date: string; amount: number; total: number }[], curr) => {
        const total = (acc[acc.length - 1]?.total || 0) + curr.amount;
        return [...acc, {
          date: curr.date,
          amount: curr.amount,
          total: total
        }];
      }, []);

    // Add target line
    if (data.length > 0) {
      data.unshift({ date: data[0].date, amount: 0, total: 0 });
    }

    return data;
  }, [history]);

  return (
    <Box sx={{ width: '100%', height: 200, mt: 2 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
          />
          {/* Target line */}
          <Area
            type="stepAfter"
            dataKey={() => targetAmount}
            stroke={theme.palette.error.main}
            strokeDasharray="5 5"
            fill="none"
            strokeWidth={2}
          />
          {/* Actual contributions line */}
          <Area
            type="monotone"
            dataKey="total"
            stroke={theme.palette.primary.main}
            fillOpacity={1}
            fill="url(#colorTotal)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ContributionChart;

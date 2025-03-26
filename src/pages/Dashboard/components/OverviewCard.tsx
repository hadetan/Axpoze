import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import CountUp from '../../../components/shared/CountUp';

interface OverviewCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ 
  title, 
  amount, 
  icon, 
  color, 
  loading = false 
}) => {
  return (
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 },
      display: 'flex', 
      alignItems: 'center', 
      gap: { xs: 1.5, sm: 2 }
    }}>
      <Box sx={{ 
        backgroundColor: `${color}15`, 
        borderRadius: '50%', 
        p: 1,
        display: 'flex' 
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6">
          <CountUp from={0} to={amount} duration={1.5} />
        </Typography>
      </Box>
    </Paper>
  );
};

export default OverviewCard;

import React from 'react';
import { Grid, Paper } from '@mui/material';
import { colors } from '../../../theme/colors';

const ExpenseStats: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: colors.primary.alpha[8],
            border: 1,
            borderColor: colors.primary.main
          }}
        >
          {/* Add your content here */}
        </Paper>
      </Grid>
      {/* Add other grid items here */}
    </Grid>
  );
};

export default ExpenseStats;
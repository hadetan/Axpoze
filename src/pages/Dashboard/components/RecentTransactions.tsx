import React from 'react';
import { 
  Paper, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Box, Chip 
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const RecentTransactions: React.FC = () => {
  // Mock data - will be replaced with real data
  const transactions = [
    {
      id: 1,
      title: 'Grocery Shopping',
      amount: -2500,
      date: '2024-01-20',
      icon: <ShoppingBagIcon />,
      category: 'Shopping'
    },
    {
      id: 2,
      title: 'Restaurant',
      amount: -800,
      date: '2024-01-19',
      icon: <FastfoodIcon />,
      category: 'Food'
    },
    {
      id: 3,
      title: 'Bus Pass',
      amount: -1200,
      date: '2024-01-18',
      icon: <DirectionsBusIcon />,
      category: 'Transport'
    },
  ];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Transactions
      </Typography>
      <List>
        {transactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemIcon>{transaction.icon}</ListItemIcon>
            <ListItemText
              primary={transaction.title}
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {transaction.date}
                  <Chip 
                    label={transaction.category} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
            />
            <Typography 
              color={transaction.amount < 0 ? 'error' : 'success.main'}
              variant="body2"
            >
              ₹{Math.abs(transaction.amount).toLocaleString()}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RecentTransactions;

import React, { useMemo } from 'react';
import { 
  Paper, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Box, Chip, CircularProgress,
  Button
} from '@mui/material';
import { useExpense } from '../../../contexts/ExpenseContext';
import { useSavings } from '../../../contexts/SavingsContext';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../../../utils/currency';
import { useNavigate } from 'react-router-dom';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface Transaction {
  id: string;
  type: 'expense' | 'saving';
  amount: number;
  date: string;
  category?: string;
  categoryColor?: string;
  description: string;
  goalName?: string;
}

const RecentTransactions: React.FC = () => {
  const { expenses, categories, loading: expenseLoading } = useExpense();
  const { history: savingsHistory, goals, loading: savingsLoading } = useSavings();
  const navigate = useNavigate();

  const transactions = useMemo<Transaction[]>(() => {
    const expenseTransactions: Transaction[] = expenses.map(expense => ({
      id: expense.id,
      type: 'expense',
      amount: -expense.amount, // Negative for expenses
      date: expense.date,
      category: categories.find(c => c.id === expense.category_id)?.name,
      categoryColor: categories.find(c => c.id === expense.category_id)?.color,
      description: expense.description
    }));

    const savingTransactions: Transaction[] = Object.entries(savingsHistory)
      .flatMap(([goalId, contributions]) => 
        contributions.map(contribution => ({
          id: contribution.id,
          type: 'saving',
          amount: contribution.amount, // Positive for savings
          date: contribution.date,
          description: contribution.notes || 'Savings contribution',
          goalName: goals.find(g => g.id === goalId)?.name
        }))
      );

    return [...expenseTransactions, ...savingTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Show only last 5 transactions
  }, [expenses, categories, savingsHistory, goals]);

  if (expenseLoading || savingsLoading) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary" gutterBottom>
          No recent transactions
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => navigate('/expenses', { state: { openAddModal: true } })}
        >
          Add Transaction
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 }, 
      height: { xs: 350, sm: 400 },
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        Recent Transactions
      </Typography>
      <List sx={{ 
        overflowX: 'auto',
        flexGrow: 1,
        mx: -1.5,
        px: 1.5,
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'action.hover',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'action.selected',
          },
        },
      }}>
        {transactions.map((transaction) => (
          <ListItem
            key={`${transaction.type}-${transaction.id}`}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              py: { xs: 1, sm: 1.5 },
              px: { xs: 1, sm: 2 },
            }}
          >
            <ListItemIcon>
              {transaction.type === 'expense' ? (
                <Box 
                  sx={{ 
                    color: transaction.categoryColor,
                    display: 'flex' 
                  }}
                >
                  <ReceiptIcon />
                </Box>
              ) : (
                <SavingsIcon color="primary" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>{transaction.description}</Typography>
                  <Typography 
                    sx={{ 
                      color: transaction.type === 'expense' ? 'error.main' : 'success.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {formatCurrency(Math.abs(transaction.amount))}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(transaction.date), 'MMM d, yyyy')}
                  </Typography>
                  {transaction.type === 'expense' ? (
                    <Chip 
                      label={transaction.category} 
                      size="small"
                      sx={{ 
                        bgcolor: `${transaction.categoryColor}20`,
                        color: transaction.categoryColor,
                        borderRadius: 1
                      }}
                    />
                  ) : (
                    <Chip 
                      label={transaction.goalName} 
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RecentTransactions;

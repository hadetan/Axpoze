import React from 'react';
import { Box, Typography, Collapse, Paper } from '@mui/material';
import { IExpenseCategory } from '../../types/expense.types';

interface CategoryBubbleProps {
  category: IExpenseCategory;
  isSelected: boolean;
  totalAmount: number;
  count: number;
  onClick: () => void;
}

const CategoryBubble: React.FC<CategoryBubbleProps> = ({
  category,
  isSelected,
  totalAmount,
  count,
  onClick,
}) => {
  return (
    <Paper
      elevation={isSelected ? 3 : 1}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: '50px',
        transition: 'all 0.3s ease',
        backgroundColor: theme => 
          isSelected 
            ? `${category.color}15` 
            : theme.palette.background.paper,
        border: 1,
        borderColor: theme => 
          isSelected 
            ? `${category.color}50` 
            : theme.palette.divider,
        '&:hover': {
          backgroundColor: `${category.color}15`,
          borderColor: `${category.color}50`,
        }
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: category.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 2,
          borderColor: `${category.color}50`,
        }}
      />
      <Box>
        <Typography variant="subtitle2">
          {category.name}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block' }}
        >
          {count} expenses · ₹{totalAmount.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CategoryBubble;

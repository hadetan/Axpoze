import React from 'react';
import { Chip, Box } from '@mui/material';
import { IExpenseCategory } from '../../types/expense.types';

interface CategoryChipProps {
  category?: IExpenseCategory;
  size?: 'small' | 'medium';
  showAmount?: boolean;
  amount?: number;
  count?: number;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ 
  category, 
  size = 'small',
  showAmount = false,
  amount,
  count
}) => {
  if (!category) return null;

  return (
    <Chip
      label={
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          '& > span': {
            color: 'text.secondary',
            fontSize: '0.85em',
            ml: 0.5
          }
        }}>
          <Box
            sx={{
              width: size === 'small' ? 8 : 10,
              height: size === 'small' ? 8 : 10,
              borderRadius: '50%',
              backgroundColor: category.color,
              flexShrink: 0,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.2)'
              }
            }}
          />
          <span>{category.name}</span>
          {showAmount && amount !== undefined && (
            <span>₹{amount.toLocaleString()}</span>
          )}
          {count !== undefined && (
            <span>({count})</span>
          )}
        </Box>
      }
      size={size}
      sx={{
        backgroundColor: `${category.color}15`,
        border: 1,
        borderColor: `${category.color}30`,
        '&:hover': {
          backgroundColor: `${category.color}25`,
          borderColor: `${category.color}50`,
        }
      }}
    />
  );
};

export default CategoryChip;

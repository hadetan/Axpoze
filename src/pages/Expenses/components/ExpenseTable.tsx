import React from 'react';
import { 
  TableContainer, Paper, IconButton, Table,
  TableHead, TableBody, TableRow, TableCell,
  Chip, Box, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { colors } from '../../../theme/colors';
import { useExpense } from '../../../contexts/ExpenseContext';
import { IExpense } from '../../../types/expense.types';
import { format } from 'date-fns';
import { formatCurrency } from '../../../utils/currency';

interface ExpenseTableProps {
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ onEdit, onDelete }) => {
  const { expenses, categories } = useExpense();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                <Chip 
                  label={expense.category?.name || 'Uncategorized'} 
                  size="small"
                  sx={{ 
                    bgcolor: `${expense.category?.color}20`,
                    color: expense.category?.color,
                    borderRadius: 1
                  }}
                />
              </TableCell>
              <TableCell align="right">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell align="right">
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(expense)}
                  sx={{ 
                    color: colors.primary.main,
                    '&:hover': {
                      bgcolor: colors.primary.alpha[8]
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(expense.id)}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExpenseTable;
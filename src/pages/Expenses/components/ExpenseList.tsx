import React, { useMemo, useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip,
  TablePagination, Box, Typography, Stack, Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useExpense } from '../../../contexts/ExpenseContext';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatCurrency } from '../../../utils/currency';
import { IExpense, IExpenseCategory } from '../../../types/expense.types';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import CategoryBubble from '../../../components/shared/CategoryBubble';

interface GroupedExpenseData {
  category: IExpenseCategory | undefined;
  expenses: IExpense[];
  totalAmount: number;
  monthlyAmount: number;
}

interface GroupedExpenses {
  [key: string]: GroupedExpenseData;
}

interface ExpenseListProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
  };
  onEdit: (expense: IExpense) => void;
  loading?: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ pagination, onEdit, loading }) => {
  const { expenses, deleteExpense } = useExpense();
  const { page, rowsPerPage, onPageChange, onRowsPerPageChange } = pagination;

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; amount: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPageState, setRowsPerPageState] = useState(5);

  const groupedExpenses = useMemo<GroupedExpenses>(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return expenses.reduce((acc, expense) => {
      // Only include expenses from current month
      const expenseDate = new Date(expense.date);
      const isCurrentMonth = isWithinInterval(expenseDate, { 
        start: monthStart, 
        end: monthEnd 
      });

      const categoryId = expense.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: expense.category,
          expenses: [],
          totalAmount: 0,
          monthlyAmount: 0
        };
      }

      acc[categoryId].expenses.push(expense);
      if (isCurrentMonth) {
        acc[categoryId].monthlyAmount += expense.amount;
      }
      acc[categoryId].totalAmount += expense.amount;
      return acc;
    }, {} as GroupedExpenses);
  }, [expenses]);

  const paginatedExpenses = useMemo(() => {
    if (!selectedCategory || !groupedExpenses[selectedCategory]) return [];
    
    const categoryExpenses = [...groupedExpenses[selectedCategory].expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const startIndex = currentPage * rowsPerPageState;
    const endIndex = startIndex + rowsPerPageState;
    
    return categoryExpenses.slice(startIndex, endIndex);
  }, [selectedCategory, groupedExpenses, currentPage, rowsPerPageState]);

  const sortedCategories = useMemo(() => {
    // Move Uncategorized to the end of the list if it exists
    return Object.entries(groupedExpenses)
      .sort((a, b) => {
        if (a[1].category?.name === 'Uncategorized') return 1;
        if (b[1].category?.name === 'Uncategorized') return -1;
        return b[1].monthlyAmount - a[1].monthlyAmount;
      });
  }, [groupedExpenses]);

  // Set first category as default selected when sorted categories change
  useEffect(() => {
    if (sortedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(sortedCategories[0][0]); // First category's ID
    }
  }, [sortedCategories, selectedCategory]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageState(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleDeleteClick = (expense: IExpense) => {
    setDeleteConfirm({ id: expense.id, amount: expense.amount });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      await deleteExpense(deleteConfirm.id);
      // Success handled by real-time update
    } catch (error) {
      console.error('Failed to delete expense:', error);
      // Show error through context or toast
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (expense: IExpense) => {
    onEdit(expense);
  };

  return (
    <Stack spacing={3}>
      {/* Category Bubbles */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          overflow: 'auto',
          flexWrap: { xs: 'nowrap', sm: 'wrap' }, // No wrap on mobile, wrap on desktop
          whiteSpace: 'nowrap',
          mx: { xs: -0.5, sm: 0 },
          px: { xs: 0.5, sm: 2 },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          minHeight: 'fit-content'
        }}
      >
        {sortedCategories.map(([categoryId, { category, expenses, monthlyAmount }]) => (
          <CategoryBubble
            key={categoryId}
            category={category!}
            isSelected={selectedCategory === categoryId}
            totalAmount={monthlyAmount}
            count={expenses.filter(e => {
              const expenseDate = new Date(e.date);
              return isWithinInterval(expenseDate, { 
                start: startOfMonth(new Date()), 
                end: endOfMonth(new Date()) 
              });
            }).length}
            onClick={() => {
              if (selectedCategory !== categoryId) {
                setSelectedCategory(categoryId);
              }
            }}
            sx={{ flexShrink: 0 }} // Prevent shrinking of bubbles
          />
        ))}
      </Box>

      {/* Expense Table */}
      <Collapse 
        in={!!selectedCategory} 
        timeout={300}
        sx={{
          transform: 'translateY(-10px)',
          transition: 'transform 0.3s ease',
          '&.Mui-expanded': {
            transform: 'translateY(0)',
          }
        }}
      >
        {selectedCategory && groupedExpenses[selectedCategory] && (
          <Paper 
            sx={{ 
              width: '100%', 
              overflow: 'hidden', 
              borderRadius: 2,
              backgroundColor: theme => 
                `${groupedExpenses[selectedCategory].category?.color}08`,
              borderColor: theme => 
                `${groupedExpenses[selectedCategory].category?.color}15`,
              borderWidth: 1,
              borderStyle: 'solid'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Mode</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedExpenses.map((expense) => (
                    <TableRow 
                      key={expense.id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <TableCell>
                        {format(new Date(expense.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Box 
                          component="span" 
                          sx={{ 
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {expense.payment_mode === 'Cash' && '💵'}
                          {expense.payment_mode === 'Card' && '💳'}
                          {expense.payment_mode === 'UPI' && '📱'}
                          {expense.payment_mode === 'Other' && '💰'}
                          {expense.payment_mode}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(expense)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(expense)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'error.contrastText',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={selectedCategory ? groupedExpenses[selectedCategory].expenses.length : 0}
              page={currentPage}
              rowsPerPage={rowsPerPageState}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: 1,
                borderColor: 'divider',
              }}
            />
          </Paper>
        )}
      </Collapse>

      {!selectedCategory && expenses.length > 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="body1" gutterBottom>
            Select a category to view expenses
          </Typography>
          <Typography variant="body2">
            Click on any category bubble above to see its expenses
          </Typography>
        </Box>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense of ${deleteConfirm ? formatCurrency(deleteConfirm.amount) : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        type="danger"
      />
    </Stack>
  );
};

export default ExpenseList;

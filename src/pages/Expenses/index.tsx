import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Button,
  Stack, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useExpense } from '../../contexts/ExpenseContext';
import ExpenseList from './components/ExpenseList';
import ExpenseFilters, { FilterValues } from './components/ExpenseFilters';
import AddExpenseModal from './components/AddExpenseModal';
import ErrorAlert from '../../components/shared/ErrorAlert';
import { IExpense } from '../../types/expense.types';

interface ExpensePagination {
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

interface FilterAccumulator {
  search?: string;
  category?: string;
  paymentMode?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  [key: string]: string | number | undefined;
}

const Expenses: React.FC = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const { loading, error, fetchExpenses, expenses } = useExpense();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    category: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
    minAmount: undefined,
    maxAmount: undefined,
  });
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  const handleFilterChange = (name: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [name]: name === 'minAmount' || name === 'maxAmount'
        ? (value === '' ? undefined : Number(value))
        : value,
    }));
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== '' && value !== undefined
    );
  };

  const handleResetFilters = useCallback(async () => {
    // Only reset if there are active filters
    if (!hasActiveFilters()) return;

    // Reset filter states
    setFilters({
      search: '',
      category: '',
      paymentMode: '',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
    
    setAppliedFilters({
      search: '',
      category: '',
      paymentMode: '',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    });

    setPage(0);
    await fetchExpenses();
  }, [fetchExpenses, filters]);

  const handleApplyFilters = useCallback(async (newFilters: FilterValues) => {
    setAppliedFilters(newFilters);
    
    const activeFilters = Object.entries(newFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as FilterAccumulator);

    await fetchExpenses(Object.keys(activeFilters).length > 0 ? activeFilters : undefined);
  }, [fetchExpenses]);

  const loadExpenses = useCallback(() => {
    const activeFilters = Object.entries(appliedFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    // Only pass filters if there are active ones
    fetchExpenses(Object.keys(activeFilters).length > 0 ? activeFilters : undefined);
  }, [fetchExpenses, appliedFilters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleAddExpense = () => {
    setOpenAddModal(true);
  };

  const handleEdit = (expense: IExpense) => {
    setEditingExpense(expense);
    setOpenAddModal(true);
  };

  const handleCloseModal = () => {
    setOpenAddModal(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography color="text.secondary" variant="body2">
          Loading expenses...
        </Typography>
      </Box>
    );
  }

  const isEmpty = !loading && expenses.length === 0;

  function setError(arg0: null) {
    throw new Error('Function not implemented.');
  }

  const paginationProps: ExpensePagination = {
    page,
    rowsPerPage,
    onPageChange: (newPage: number) => setPage(newPage),
    onRowsPerPageChange: (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    }
  };

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Expenses</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddExpense}
          >
            Add Expense
          </Button>
        </Stack>

        <ErrorAlert
          error={error}
          onClose={() => {
            setError(null);
            loadExpenses();
          }}
          action={
            <Button color="inherit" size="small" onClick={() => loadExpenses()}>
              Try Again
            </Button>
          }
        />

        <ExpenseFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onApplyFilters={handleApplyFilters}
          isLoading={loading}
          disabled={Boolean(error)}
        />

        {isEmpty ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No expenses found
            </Typography>
            <Typography color="text.secondary" mb={2}>
              {filters.category || filters.search || filters.paymentMode
                ? 'Try adjusting your filters'
                : 'Start by adding your first expense'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddExpense}
            >
              Add Expense
            </Button>
          </Box>
        ) : (
          <ExpenseList 
            pagination={paginationProps}
            onEdit={handleEdit}
          />
        )}
      </Stack>

      <AddExpenseModal
        open={openAddModal}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </Container>
  );
};

export default Expenses;

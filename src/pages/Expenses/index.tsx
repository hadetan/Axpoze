import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Button,
  Stack, CircularProgress, Collapse, Paper, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import CategoryIcon from '@mui/icons-material/Category';
import { useExpense } from '../../contexts/ExpenseContext';
import ExpenseList from './components/ExpenseList';
import ExpenseFilters, { FilterValues } from './components/ExpenseFilters';
import AddExpenseModal from './components/AddExpenseModal';
import ErrorAlert from '../../components/shared/ErrorAlert';
import { IExpense } from '../../types/expense.types';
import { useLocation } from 'react-router-dom';

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
  const { loading, error, fetchExpenses, expenses, categories } = useExpense();
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
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const location = useLocation();

  // Handle automatic modal opening from navigation state
  useEffect(() => {
    if (location.state?.openAddModal) {
      setOpenAddModal(true);
      // Clear the state to prevent modal from reopening on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const renderFilterCapsules = () => {
    const activeFilters = [];

    if (filters.search) {
      activeFilters.push({
        key: 'search',
        label: `Search: ${filters.search}`,
        icon: <SearchIcon sx={{ fontSize: '1.2rem' }} />
      });
    }
    if (filters.category) {
      const category = categories.find(c => c.id === filters.category);
      activeFilters.push({
        key: 'category',
        label: `Category: ${category?.name || 'Unknown'}`,
        icon: <CategoryIcon sx={{ fontSize: '1.2rem' }} />,
        color: category?.color
      });
    }
    if (filters.paymentMode) {
      activeFilters.push({
        key: 'payment',
        label: `Payment: ${filters.paymentMode}`,
        icon: <PaymentIcon sx={{ fontSize: '1.2rem' }} />
      });
    }
    if (filters.startDate || filters.endDate) {
      activeFilters.push({
        key: 'date',
        label: 'Date Filter Applied',
        icon: <EventIcon sx={{ fontSize: '1.2rem' }} />
      });
    }

    return activeFilters.length > 0 ? (
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 1,
          overflowX: 'auto',
          px: 2,
          py: 1,
          mx: -2, // Compensate for container padding
          scrollbarWidth: 'none', // Firefox
          '::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {activeFilters.map(filter => (
          <Chip
            key={filter.key}
            label={filter.label}
            icon={filter.icon}
            size="small"
            color={filter.color ? undefined : "primary"}
            sx={{
              bgcolor: filter.color ? `${filter.color}20` : undefined,
              color: filter.color ? filter.color : undefined,
              borderColor: filter.color,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          />
        ))}
      </Box>
    ) : null;
  };

  return (
    <Container maxWidth="lg">
      <Stack spacing={{ xs: 1.5, sm: 3 }}>  {/* Reduced spacing on mobile */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Expenses
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddExpense}
            fullWidth={false}
            sx={{ 
              minHeight: { xs: 45, sm: 'auto' },
              alignSelf: { xs: 'stretch', sm: 'auto' }
            }}
          >
            Add Expense
          </Button>
        </Stack>

        {/* Mobile Filter Toggle */}
        <Box sx={{ 
          display: { xs: 'block', sm: 'none' },
          '& .MuiPaper-root': {  // Style adjustments for the toggle button
            py: 1.5,  // Reduced padding
            px: 2,
          }
        }}>
          <Paper
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: 'background.default',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              mb: hasActiveFilters() ? 1 : 0
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterListIcon 
                color="primary" 
                sx={{ fontSize: '1.25rem' }}  // Slightly smaller icon
              />
              <Typography variant="body2">  {/* Smaller text */}
                {hasActiveFilters() ? 'Filters Applied' : 'Filter Expenses'}
              </Typography>
            </Stack>
            {isFilterVisible ? (
              <KeyboardArrowUpIcon sx={{ fontSize: '1.25rem' }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: '1.25rem' }} />
            )}
          </Paper>

          {/* Render Filter Capsules */}
          {renderFilterCapsules()}
        </Box>

        {/* Filter Section */}
        <Box sx={{ 
          display: { xs: 'block', sm: 'block' },
          mt: { xs: 0, sm: undefined }  // Remove top margin on mobile
        }}>
          <Collapse in={isFilterVisible || window.innerWidth >= 600}>
            <ExpenseFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onApplyFilters={handleApplyFilters}
              isLoading={loading}
              disabled={Boolean(error)}
            />
          </Collapse>
        </Box>

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

        {isEmpty ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 4, sm: 8 },
              px: { xs: 2, sm: 2 },
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h6" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              No expenses found
            </Typography>
            <Typography 
              color="text.secondary" 
              mb={2}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {filters.category || filters.search || filters.paymentMode
                ? 'Try adjusting your filters'
                : 'Start by adding your first expense'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddExpense}
              sx={{ minHeight: { xs: 45, sm: 'auto' } }}
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

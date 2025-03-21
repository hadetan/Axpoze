import React, { useState } from 'react';
import {
  Paper, Stack, TextField, MenuItem, Box,
  InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterListIcon from '@mui/icons-material/FilterList';
import LoadingButton from '@mui/lab/LoadingButton';
import { useExpense } from '../../../contexts/ExpenseContext';
import { PaymentMode } from '../../../types/expense.types';

export interface FilterValues {
  search: string;
  category: string;
  paymentMode: string;
  startDate: string;
  endDate: string;
  minAmount: number | undefined;
  maxAmount: number | undefined;
}

interface ExpenseFiltersProps {
  filters: FilterValues;
  onFilterChange: (name: string, value: string | number) => void;
  onResetFilters: () => void;
  onApplyFilters: (filters: FilterValues) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

const PAYMENT_MODES: { value: PaymentMode; label: string; icon: string }[] = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Card', label: 'Card', icon: '💳' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'Other', label: 'Other', icon: '💰' },
];

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters: externalFilters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  isLoading = false,
  disabled = false
}) => {
  // Local state for filters
  const [localFilters, setLocalFilters] = useState<FilterValues>(externalFilters);
  const { categories } = useExpense();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newValue = name === 'minAmount' || name === 'maxAmount'
      ? (value === '' ? undefined : Number(value))
      : value;

    setLocalFilters(prev => ({ ...prev, [name]: newValue }));
    onFilterChange(name, value);
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      paymentMode: '',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            name="search"
            label="Search"
            size="small"
            value={localFilters.search}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
            disabled={disabled}
          />
          <Stack direction="row" spacing={1} sx={{ minWidth: 200 }}>
            <TextField
              name="minAmount"
              label="Min Amount"
              size="small"
              type="number"
              value={localFilters.minAmount || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    ₹
                  </InputAdornment>
                ),
              }}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              name="maxAmount"
              label="Max Amount"
              size="small"
              type="number"
              value={localFilters.maxAmount || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    ₹
                  </InputAdornment>
                ),
              }}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
          </Stack>
          <TextField
            select
            name="category"
            label="Category"
            size="small"
            value={localFilters.category}
            onChange={handleChange}
            sx={{
              minWidth: 200,
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }
            }}
            disabled={disabled}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem
                key={category.id}
                value={category.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                  '& .category-dot': {
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    border: 1,
                    borderColor: `${category.color}50`,
                    transition: 'transform 0.2s',
                  },
                  '&:hover .category-dot': {
                    transform: 'scale(1.2)',
                  },
                }}
              >
                <Box className="category-dot" />
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="paymentMode"
            label="Payment Mode"
            size="small"
            value={localFilters.paymentMode}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PaymentIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
            disabled={disabled}
          >
            <MenuItem value="">All Modes</MenuItem>
            {PAYMENT_MODES.map(mode => (
              <MenuItem 
                key={mode.value} 
                value={mode.value}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    fontSize: '1.2rem',
                    width: 24,
                    textAlign: 'center'
                  }}
                >
                  {mode.icon}
                </Box>
                {mode.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            name="startDate"
            label="From Date"
            type="date"
            size="small"
            value={localFilters.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
            disabled={disabled}
          />
          <TextField
            name="endDate"
            label="To Date"
            type="date"
            size="small"
            value={localFilters.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
            disabled={disabled}
          />
          <Box flexGrow={1} />
        </Stack>
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="flex-end"
          sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            startIcon={<FilterAltOffIcon />}
            onClick={handleReset}
            size="medium"
            disabled={disabled || isLoading}
            color="inherit"
          >
            Reset
          </Button>
          <LoadingButton
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleApplyFilters}
            loading={isLoading}
            disabled={disabled}
          >
            Apply Filters
          </LoadingButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ExpenseFilters;

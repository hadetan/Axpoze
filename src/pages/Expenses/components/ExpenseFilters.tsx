import React, { useState } from 'react';
import {
  Paper, Stack, TextField, MenuItem, Box,
  InputAdornment, Button, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterListIcon from '@mui/icons-material/FilterList';
import LoadingButton from '@mui/lab/LoadingButton';
import { useExpense } from '../../../contexts/ExpenseContext';
import { PaymentMode } from '../../../types/expense.types';
import { format } from 'date-fns';

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

  const handleNumericInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Only allow numbers and empty string
    if (value === '' || /^\d*$/.test(value)) {
      setLocalFilters(prev => ({ ...prev, [name]: value }));
      onFilterChange(name, value);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const selectedDate = new Date(value);
    const today = new Date();
    
    // If selected date is in future, use today's date
    const adjustedDate = selectedDate > today ? today : selectedDate;
    const formattedDate = format(adjustedDate, 'yyyy-MM-dd');

    setLocalFilters(prev => ({ ...prev, [name]: formattedDate }));
    onFilterChange(name, formattedDate);
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

  // Get today's date in YYYY-MM-DD format for max date
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* First Row: Search and Payment Mode */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          alignItems="flex-start"
        >
          <TextField
            name="search"
            label="Search expenses"
            placeholder="Search by description..."
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
            sx={{ 
              flex: { sm: 2 },
              minWidth: { xs: '100%', sm: 300 }
            }}
            disabled={disabled}
          />
          
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
            sx={{ 
              flex: { sm: 1 },
              minWidth: { xs: '100%', sm: 200 }
            }}
            disabled={disabled}
          >
            <MenuItem value="">All Payment Modes</MenuItem>
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
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  {mode.icon}
                </Box>
                {mode.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Second Row: Amount Range and Date Range */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.default',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack spacing={2}>
            {/* Amount Range */}
            <Box>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                gutterBottom
                sx={{ ml: 1 }}
              >
                Amount Range
              </Typography>
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ width: '100%' }}
              >
                <TextField
                  name="minAmount"
                  placeholder="Min"
                  size="small"
                  value={localFilters.minAmount || ''}
                  onChange={handleNumericInput}
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
                  placeholder="Max"
                  size="small"
                  value={localFilters.maxAmount || ''}
                  onChange={handleNumericInput}
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
            </Box>

            {/* Date Range */}
            <Box>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                gutterBottom
                sx={{ ml: 1 }}
              >
                Date Range
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
              >
                <TextField
                  name="startDate"
                  type="date"
                  size="small"
                  value={localFilters.startDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                  disabled={disabled}
                />
                <TextField
                  name="endDate"
                  type="date"
                  size="small"
                  value={localFilters.endDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                  disabled={disabled}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="flex-end"
          sx={{ 
            pt: 2,
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Button
            startIcon={<FilterAltOffIcon />}
            onClick={handleReset}
            size="medium"
            disabled={disabled || isLoading}
            color="inherit"
            sx={{ minWidth: 100 }}
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

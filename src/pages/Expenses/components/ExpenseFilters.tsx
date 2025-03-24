import React, { useState } from 'react';
import {
  Paper, Stack, TextField, MenuItem, Box,
  InputAdornment, Button, Typography, Chip
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
import { colors } from '../../../theme/colors';

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
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 },
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1.5, sm: 2 }
    }}>
      {/* Mobile Category Capsules */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 1,
          overflowX: 'auto',
          mx: -1.5, // Compensate for padding
          px: 1.5,
          pb: 1,
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        <Chip
          label="All Categories"
          size="small"
          color={!localFilters.category ? "primary" : "default"}
          onClick={() => {
            handleChange({ 
              target: { name: 'category', value: '' } 
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          sx={{ flexShrink: 0 }}
        />
        {categories.map(category => (
          <Chip
            key={category.id}
            label={category.name}
            size="small"
            color={localFilters.category === category.id ? undefined : "default"}
            onClick={() => {
              handleChange({ 
                target: { name: 'category', value: category.id } 
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            sx={{
              bgcolor: localFilters.category === category.id ? `${category.color}20` : undefined,
              color: localFilters.category === category.id ? category.color : undefined,
              borderColor: localFilters.category === category.id ? category.color : undefined,
              flexShrink: 0
            }}
          />
        ))}
      </Box>

      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={{ xs: 1.5, sm: 2 }}
      >
        {/* Search Field */}
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
            flex: 2,
            minWidth: { xs: '100%', sm: 250 }
          }}
          disabled={disabled}
        />

        {/* Category Select - Only visible on desktop */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: 1 }}>
          <TextField
            select
            name="category"
            label="Category"
            size="small"
            value={localFilters.category}
            onChange={handleChange}
            fullWidth
            disabled={disabled}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      border: 1,
                      borderColor: `${category.color}50`
                    }}
                  />
                  <span>{category.name}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Payment Mode Select */}
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
            flex: 1,
            minWidth: { xs: '100%', sm: 150 }
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

      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={{ xs: 1.5, sm: 2 }}
      >
        {/* Date Range Fields */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ flex: 2 }}
        >
          <TextField // Start Date
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
            fullWidth
            disabled={disabled}
          />
          <TextField // End Date
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
            fullWidth
            disabled={disabled}
          />
        </Stack>

        {/* Amount Range Fields */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ flex: 1 }}
        >
          <TextField // Min Amount
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
            fullWidth
            disabled={disabled}
          />
          <TextField // Max Amount
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
            fullWidth
            disabled={disabled}
          />
        </Stack>
      </Stack>

      <Stack 
        direction="row" 
        spacing={1}
        sx={{ 
          borderTop: 1,
          borderColor: 'divider',
          pt: { xs: 1.5, sm: 2 },
          mt: { xs: 0.5, sm: 1 },
          position: { xs: 'sticky', sm: 'static' },
          bottom: { xs: 0, sm: 'auto' },
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          startIcon={<FilterAltOffIcon />}
          disabled={disabled}
          sx={{ 
            minHeight: { xs: 45, sm: 'auto' },
            borderColor: colors.primary.main,
            color: colors.primary.main,
            '&:hover': {
              borderColor: colors.primary.dark,
              bgcolor: colors.primary.alpha[8]
            }
          }}
        >
          Reset
        </Button>
        <LoadingButton
          fullWidth
          variant="contained"
          onClick={handleApplyFilters}
          loading={isLoading}
          startIcon={<FilterListIcon />}
          disabled={disabled}
          sx={{ minHeight: { xs: 45, sm: 'auto' } }}
        >
          Apply Filters
        </LoadingButton>
      </Stack>
    </Paper>
  );
};

export default ExpenseFilters;

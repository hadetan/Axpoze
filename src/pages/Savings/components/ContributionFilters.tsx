import React from 'react';
import {
  Paper, Stack, TextField, MenuItem,
  InputAdornment, IconButton, Box,
  Button, Collapse
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { LoadingButton } from '@mui/lab';

export interface ContributionFilters {
  search: string;
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: number | '';
    max: number | '';
  };
  sortBy: 'date' | 'amount' | 'notes';
  sortOrder: 'asc' | 'desc';
  filterType: 'all' | 'thisMonth' | 'lastMonth' | 'custom';
}

interface ContributionFiltersProps {
  filters: ContributionFilters;
  onFilterChange: (filters: ContributionFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

const ContributionFilters: React.FC<ContributionFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  loading = false
}) => {
  const handleChange = (field: keyof ContributionFilters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by notes..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            value={filters.filterType}
            onChange={(e) => handleChange('filterType', e.target.value)}
            label="Time Period"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="thisMonth">This Month</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            sx={{ minWidth: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SortIcon color="action" />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="date">Sort by Date</MenuItem>
            <MenuItem value="amount">Sort by Amount</MenuItem>
            <MenuItem value="notes">Sort by Notes</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={filters.sortOrder}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            sx={{ width: 100 }}
          >
            <MenuItem value="desc">DESC</MenuItem>
            <MenuItem value="asc">ASC</MenuItem>
          </TextField>
        </Stack>

        <Collapse in={filters.filterType === 'custom'}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              type="date"
              label="Start Date"
              value={filters.dateRange.start}
              onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              type="date"
              label="End Date"
              value={filters.dateRange.end}
              onChange={(e) => handleChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Collapse>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            type="number"
            label="Min Amount"
            value={filters.amountRange.min}
            onChange={(e) => handleChange('amountRange', { ...filters.amountRange, min: e.target.value })}
          />

          <TextField
            size="small"
            type="number"
            label="Max Amount"
            value={filters.amountRange.max}
            onChange={(e) => handleChange('amountRange', { ...filters.amountRange, max: e.target.value })}
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            onClick={onReset}
            disabled={loading}
          >
            Reset
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={loading}
            startIcon={<FilterListIcon />}
            onClick={() => {/* Apply filters */}}
          >
            Apply Filters
          </LoadingButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ContributionFilters;

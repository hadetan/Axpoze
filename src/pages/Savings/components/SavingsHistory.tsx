import React, { useState, useMemo } from 'react';
import {
  Paper, Typography, Stack, Box, Chip,
  IconButton, List, ListItem, ListItemText,
  LinearProgress, Button, MenuItem, Tooltip, Menu,
  InputAdornment, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import { ISavingsGoal, ISavingsHistory } from '../../../types/savings.types';
import { useSavings } from '../../../contexts/SavingsContext';
import { formatCurrency } from '../../../utils/currency';
import { format, isWithinInterval, subMonths } from 'date-fns';
import AddContributionModal from './AddContributionModal';
import ContributionSummary from './ContributionSummary';
import ConfirmDialog from '../../../components/ConfirmDialog';

interface SavingsHistoryProps {
  goal: ISavingsGoal;
}

interface FilterState {
  dateRange: 'all' | '1m' | '3m' | '6m' | '1y';
  minAmount?: number;
  maxAmount?: number;
  search: string;
}

const SavingsHistory: React.FC<SavingsHistoryProps> = ({ goal }) => {
  const [openModal, setOpenModal] = useState(false);
  const { history, loadingHistory, fetchHistory, addContribution, deleteContribution } = useSavings();
  const goalHistory = history[goal.id] || [];

  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    search: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; amount: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  React.useEffect(() => {
    fetchHistory(goal.id);
  }, [goal.id, fetchHistory]);

  const handleAddContribution = async (data: ISavingsHistoryFormData) => {
    await addContribution(goal.id, data);
    setOpenModal(false);
  };

  const handleDeleteClick = (contribution: ISavingsHistory) => {
    setDeleteConfirm({
      id: contribution.id,
      amount: contribution.amount
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      await deleteContribution(goal.id, deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete contribution:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return goalHistory
      .filter(contribution => {
        const date = new Date(contribution.date);
        const matchesDate = filters.dateRange === 'all' || isWithinInterval(date, {
          start: subMonths(new Date(), {
            '1m': 1,
            '3m': 3,
            '6m': 6,
            '1y': 12,
            'all': 0
          }[filters.dateRange]),
          end: new Date()
        });

        const matchesAmount = (!filters.minAmount || contribution.amount >= filters.minAmount) &&
                            (!filters.maxAmount || contribution.amount <= filters.maxAmount);

        const matchesSearch = !filters.search || 
          contribution.notes?.toLowerCase().includes(filters.search.toLowerCase());

        return matchesDate && matchesAmount && matchesSearch;
      })
      .sort((a, b) => {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'date') {
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
        }
        return (a.amount - b.amount) * multiplier;
      });
  }, [goalHistory, sortBy, sortOrder, filters]);

  if (loadingHistory) {
    return <LinearProgress />;
  }

  return (
    <Stack spacing={3}>
      <ContributionSummary
        history={goalHistory}
        targetAmount={goal.target_amount}
        currentAmount={goal.current_amount}
      />

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h6" sx={{ flex: 1 }}>
          Contribution History
        </Typography>

        <TextField
          size="small"
          placeholder="Search notes..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          sx={{ width: 200 }}
        />

        <TextField
          select
          size="small"
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            dateRange: e.target.value as FilterState['dateRange'] 
          }))}
          sx={{ width: 120 }}
        >
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="1m">Last Month</MenuItem>
          <MenuItem value="3m">Last 3 Months</MenuItem>
          <MenuItem value="6m">Last 6 Months</MenuItem>
          <MenuItem value="1y">Last Year</MenuItem>
        </TextField>

        <Tooltip title="Sort">
          <IconButton onClick={(e) => setSortAnchor(e.currentTarget)}>
            <SortIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
        >
          <MenuItem 
            onClick={() => {
              setSortBy('date');
              setSortOrder('desc');
              setSortAnchor(null);
            }}
            selected={sortBy === 'date' && sortOrder === 'desc'}
          >
            Newest First
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSortBy('date');
              setSortOrder('asc');
              setSortAnchor(null);
            }}
            selected={sortBy === 'date' && sortOrder === 'asc'}
          >
            Oldest First
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSortBy('amount');
              setSortOrder('desc');
              setSortAnchor(null);
            }}
            selected={sortBy === 'amount' && sortOrder === 'desc'}
          >
            Highest Amount
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSortBy('amount');
              setSortOrder('asc');
              setSortAnchor(null);
            }}
            selected={sortBy === 'amount' && sortOrder === 'asc'}
          >
            Lowest Amount
          </MenuItem>
        </Menu>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          variant="contained"
          size="small"
        >
          Add Contribution
        </Button>
      </Stack>

      <List>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((contribution) => (
            <ListItem
              key={contribution.id}
              divider
              sx={{
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {formatCurrency(contribution.amount)}
                    </Typography>
                    <Chip
                      label={format(new Date(contribution.date), 'MMM d, yyyy')}
                      size="small"
                      variant="outlined"
                    />
                    {contribution.notes && (
                      <Tooltip title={contribution.notes}>
                        <Chip
                          label={contribution.notes}
                          size="small"
                          sx={{ 
                            maxWidth: 200,
                            '.MuiChip-label': {
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                }
              />

              <Tooltip title="Delete Contribution">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(contribution)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            bgcolor: 'action.hover',
            borderRadius: 1
          }}>
            <Typography color="text.secondary" gutterBottom>
              No contributions yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by adding your first contribution
            </Typography>
          </Box>
        )}
      </List>

      <AddContributionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddContribution}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Contribution"
        message={`Are you sure you want to delete this contribution of ${deleteConfirm ? formatCurrency(deleteConfirm.amount) : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        type="danger"
      />
    </Stack>
  );
};

export default SavingsHistory;

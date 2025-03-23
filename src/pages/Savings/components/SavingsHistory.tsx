import React, { useState, useMemo } from 'react';
import {
  Paper, Typography, Stack, Box, Chip,
  IconButton, List, ListItem, ListItemText,
  LinearProgress, Button, TablePagination,
  Checkbox, Fade, Alert,
  Menu, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ISavingsGoal, ISavingsHistory, ISavingsHistoryFormData, ISavingsMilestone, ISavingsMilestoneFormData } from '../../../types/savings.types';
import { useSavings } from '../../../contexts/SavingsContext';
import { formatCurrency } from '../../../utils/currency';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import AddContributionModal from './AddContributionModal';
import ContributionSummary from './ContributionSummary';
import ContributionFilters, { ContributionFilters as IContributionFilters } from './ContributionFilters';
import TablePaginationActions from '../../../components/shared/TablePaginationActions';
import BulkActionsToolbar from './BulkActionsToolbar';
import ContributionChart from '../../../components/shared/ContributionChart';
import SavingsMilestones from './SavingsMilestones';
import MilestoneAnalytics from '../../../components/shared/MilestoneAnalytics';
import AchievementCelebration from '../../../components/shared/AchievementCelebration';

interface SavingsHistoryProps {
  goal: ISavingsGoal;
}

const SavingsHistory: React.FC<SavingsHistoryProps> = ({ goal }) => {
  const { 
    history, 
    loadingHistory, 
    fetchHistory, 
    addContribution,
    milestones,  // Remove the default empty array
    addMilestone,
    updateMilestone,
    deleteMilestone,
    fetchMilestones,
    deleteContribution // Add this
  } = useSavings();
  const goalHistory = history[goal.id] || [];
  const goalMilestones = milestones[goal.id] || []; // Create a variable for goal's milestones

  const [filters, setFilters] = useState<IContributionFilters>({
    search: '',
    dateRange: {
      start: '',
      end: '',
    },
    amountRange: {
      min: '',
      max: '',
    },
    sortBy: 'date',
    sortOrder: 'desc',
    filterType: 'all', // Add this property
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [achievedMilestone, setAchievedMilestone] = useState<ISavingsMilestone | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const filteredHistory = useMemo(() => {
    let filtered = [...goalHistory];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(item => 
        item.notes?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply time period filter
    switch (filters.filterType) {
      case 'thisMonth': {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        filtered = filtered.filter(item => {
          const date = new Date(item.date);
          return date >= start && date <= end;
        });
        break;
      }
      case 'lastMonth': {
        const lastMonth = subMonths(new Date(), 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);
        filtered = filtered.filter(item => {
          const date = new Date(item.date);
          return date >= start && date <= end;
        });
        break;
      }
      case 'custom': {
        // ...existing date range filter code...
      }
    }

    // Apply amount range filter
    if (filters.amountRange.min !== '') {
      filtered = filtered.filter(item => 
        item.amount >= Number(filters.amountRange.min)
      );
    }
    if (filters.amountRange.max !== '') {
      filtered = filtered.filter(item => 
        item.amount <= Number(filters.amountRange.max)
      );
    }

    // Enhanced sorting
    filtered.sort((a, b) => {
      let compareValue: number;
      
      switch (filters.sortBy) {
        case 'date':
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'notes':
          compareValue = (a.notes || '').localeCompare(b.notes || '');
          break;
        default:
          compareValue = 0;
      }
      
      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [goalHistory, filters]);

  const filteredAndPaginatedHistory = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredHistory.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredHistory, page, rowsPerPage]);

  React.useEffect(() => {
    fetchHistory(goal.id);
    fetchMilestones(goal.id); // Add this to fetch milestones
  }, [goal.id, fetchHistory, fetchMilestones]);

  const handleAddContribution = async (data: ISavingsHistoryFormData) => {
    try {
      await addContribution(goal.id, data);
      
      // Check if any milestone was just achieved
      const latestMilestone = goalMilestones
        .find(m => !m.achieved && m.target_amount <= goal.current_amount + data.amount);
      
      if (latestMilestone) {
        setAchievedMilestone(latestMilestone);
      }
      
      setOpenModal(false);
    } catch (error) {
      console.error('Failed to add contribution:', error);
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredAndPaginatedHistory.map(item => item.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selected) {
        await deleteContribution(goal.id, id);
      }
      setSelected([]);
    } catch (error) {
      console.error('Failed to delete contributions:', error);
    }
  };

  const handleUpdateMilestone = async (id: string, data: ISavingsMilestoneFormData) => {
    try {
      await updateMilestone(id, data);
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      await deleteMilestone(id);
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

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

      <SavingsMilestones
        goal={goal}
        milestones={goalMilestones}
        history={goalHistory} // Add this prop
        onAddMilestone={async (data) => {
          await addMilestone(goal.id, data);
        }}
        onUpdateMilestone={handleUpdateMilestone}
        onDeleteMilestone={handleDeleteMilestone}
      />

      <MilestoneAnalytics
        milestones={goalMilestones}
        currentAmount={goal.current_amount}
      />

      <ContributionChart 
        history={goalHistory} 
        milestones={goalMilestones}
      />

      <ContributionFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({
          search: '',
          dateRange: { start: '', end: '' },
          amountRange: { min: '', max: '' },
          sortBy: 'date',
          sortOrder: 'desc',
          filterType: 'all', // Add this property
        })}
        loading={loadingHistory}
      />

      <BulkActionsToolbar
        numSelected={selected.length}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelected([])}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Contribution History</Typography>
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
        {filteredAndPaginatedHistory.length > 0 ? (
          <>
            <ListItem
              sx={{
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Checkbox
                indeterminate={
                  selected.length > 0 && 
                  selected.length < filteredAndPaginatedHistory.length
                }
                checked={
                  filteredAndPaginatedHistory.length > 0 &&
                  selected.length === filteredAndPaginatedHistory.length
                }
                onChange={handleSelectAllClick}
              />
              <ListItemText 
                primary="Select All"
                sx={{ ml: 2 }}
              />
            </ListItem>

            {filteredAndPaginatedHistory.map((contribution) => (
              <ListItem
                key={contribution.id}
                divider
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: selected.includes(contribution.id) 
                    ? 'action.selected' 
                    : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <Checkbox
                  checked={selected.includes(contribution.id)}
                  onChange={() => handleSelectOne(contribution.id)}
                  onClick={(e) => e.stopPropagation()}
                />
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
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {contribution.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {contribution.notes}
                        </Typography>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
            <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider' }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                sx={{
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    m: 0,
                  },
                }}
              />
            </Box>
          </>
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

      <AchievementCelebration
        milestone={achievedMilestone}
        onClose={() => setAchievedMilestone(null)}
      />
    </Stack>
  );
};

export default SavingsHistory;

import React, { useEffect } from 'react';
import {
  Container, Typography, Stack, Button,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSavings } from '../../contexts/SavingsContext';
import SavingsGoalList from './components/SavingsGoalList';
import SavingsOverview from './components/SavingsOverview';
import AddSavingsGoalModal from './components/AddSavingsGoalModal';
import ErrorAlert from '../../components/shared/ErrorAlert';
import { ISavingsGoal } from '../../types/savings.types';

const Savings: React.FC = () => {
  const { goals, loading, error, fetchGoals } = useSavings();
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<ISavingsGoal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = () => {
    setOpenAddModal(true);
  };

  const handleEdit = (goal: ISavingsGoal) => {
    setEditingGoal(goal);
    setOpenAddModal(true);
  };

  const handleCloseModal = () => {
    setOpenAddModal(false);
    setEditingGoal(null);
  };

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Savings Goals</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddGoal}
          >
            Add Goal
          </Button>
        </Stack>

        {error && (
          <ErrorAlert
            error={error}
            onClose={() => {}}
            onError={() => {}}
          />
        )}

        <Grid container spacing={3}>
          {/* Overview Section */}
          <Grid item xs={12} md={4}>
            <SavingsOverview />
          </Grid>

          {/* Goals List Section */}
          <Grid item xs={12} md={8}>
            <SavingsGoalList 
              goals={goals}
              loading={loading}
              onEdit={handleEdit}
            />
          </Grid>
        </Grid>
      </Stack>

      <AddSavingsGoalModal
        open={openAddModal}
        onClose={handleCloseModal}
        goal={editingGoal}
      />
    </Container>
  );
};

export default Savings;

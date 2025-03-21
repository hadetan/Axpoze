import React, { useEffect } from 'react';
import {
  Container, Grid, Typography, Paper, Box,
  Tab, Tabs, Divider
} from '@mui/material';
import CategorySettings from './components/CategorySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { authState } = useAuth();
  const { fetchExpenses } = useExpense();

  // Add useEffect to fetch data on mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        <Typography color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                }
              }}
            >
              <Tab label="Categories" />
              <Tab label="Preferences" />
              <Tab label="Account" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          {activeTab === 0 && <CategorySettings />}
          {/* Add other settings panels here */}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;

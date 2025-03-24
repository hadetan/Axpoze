import React, { useEffect } from 'react';
import {
  Container, Grid, Typography, Paper, Box,
  Tab, Tabs, Divider
} from '@mui/material';
import CategorySettings from './components/CategorySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import ThemeSwitch from '../../components/settings/ThemeSwitch';
import { colors } from '../../theme/colors';

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
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            color: colors.primary.main,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Profile Settings
        </Typography>
        <Typography 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Navigation - Horizontal on mobile, Vertical on desktop */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                  },
                  '& .Mui-selected': {
                    color: colors.primary.main,
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: colors.primary.main,
                  }
                }}
              >
                <Tab label="Categories" />
                <Tab label="Preferences" />
                <Tab label="Account" />
              </Tabs>
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                variant="fullWidth"
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': {
                    minHeight: 48,
                    fontSize: '0.875rem',
                  },
                  '& .Mui-selected': {
                    color: colors.primary.main,
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: colors.primary.main,
                  }
                }}
              >
                <Tab 
                  label="Categories" 
                  sx={{ 
                    flex: 1,
                    minWidth: 0,
                    px: 1
                  }} 
                />
                <Tab 
                  label="Preferences" 
                  sx={{ 
                    flex: 1,
                    minWidth: 0,
                    px: 1
                  }} 
                />
                <Tab 
                  label="Account" 
                  sx={{ 
                    flex: 1,
                    minWidth: 0,
                    px: 1
                  }} 
                />
              </Tabs>
            </Box>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          <Box sx={{ 
            mt: { xs: 2, md: 0 },
            transition: 'all 0.2s ease'
          }}>
            {activeTab === 0 && <CategorySettings />}
            {activeTab === 1 && (
              <Paper sx={{ 
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 1, sm: 2 }
              }}>
                <ThemeSwitch />
              </Paper>
            )}
            {/* Add other settings panels here */}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;

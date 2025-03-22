import React, { useState } from 'react';
import {
  Container, Typography, Stack, Tabs,
  Tab, Box, Divider, Badge
} from '@mui/material';
import NotificationList from './components/NotificationList';
import NotificationPreferences from './components/NotificationPreferences';
import { useNotification } from '../../contexts/NotificationContext';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { unreadCount } = useNotification();

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4">Notifications</Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, value) => setActiveTab(value)}
            sx={{ '& .MuiBadge-root': { mr: 2 } }}
          >
            <Tab 
              label={
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  Notifications
                </Badge>
              } 
            />
            <Tab label="Preferences" />
          </Tabs>
        </Box>

        <Box>
          {activeTab === 0 && <NotificationList />}
          {activeTab === 1 && <NotificationPreferences />}
        </Box>
      </Stack>
    </Container>
  );
};

export default Notifications;

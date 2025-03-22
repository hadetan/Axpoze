import React, { useState } from 'react';
import {
  Paper, List, ListItem, ListItemText,
  Typography, IconButton, Stack, Menu,
  MenuItem, Chip, Box, CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { NotificationPriority } from '../../../types/notification.types';

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    default: return 'info';
  }
};

const NotificationList: React.FC = () => {
  const { notifications, loading, markAsRead, archiveNotification, deleteNotification } = useNotification();
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const navigate = useNavigate();

  const handleClick = async (notificationId: string, url?: string) => {
    if (url) {
      await markAsRead(notificationId);
      navigate(url);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    event.stopPropagation();
    setMenuAnchor(prev => ({ ...prev, [notificationId]: event.currentTarget }));
  };

  const handleMenuClose = (notificationId: string) => {
    setMenuAnchor(prev => ({ ...prev, [notificationId]: null }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!notifications.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No notifications to display
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <List>
        {notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <ListItem
              sx={{
                cursor: 'pointer',
                bgcolor: notification.status === 'unread' ? 'action.hover' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => handleClick(notification.id, notification.action_url)}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {notification.title}
                    </Typography>
                    {notification.status === 'unread' && (
                      <Chip 
                        label="New" 
                        size="small" 
                        color={getPriorityColor(notification.priority)}
                      />
                    )}
                  </Stack>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" gutterBottom>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                }
              />

              <IconButton
                edge="end"
                onClick={(e) => handleMenuOpen(e, notification.id)}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={menuAnchor[notification.id]}
                open={Boolean(menuAnchor[notification.id])}
                onClose={() => handleMenuClose(notification.id)}
              >
                {notification.status === 'unread' && (
                  <MenuItem onClick={() => {
                    markAsRead(notification.id);
                    handleMenuClose(notification.id);
                  }}>
                    Mark as read
                  </MenuItem>
                )}
                <MenuItem onClick={() => {
                  archiveNotification(notification.id);
                  handleMenuClose(notification.id);
                }}>
                  Archive
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    deleteNotification(notification.id);
                    handleMenuClose(notification.id);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default NotificationList;

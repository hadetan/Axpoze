import React from 'react';
import {
  Popover, Box, Typography, List,
  ListItem, ListItemText, IconButton,
  Divider, Button, CircularProgress,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

interface NotificationPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ 
  open, 
  anchorEl, 
  onClose 
}) => {
  const { 
    notifications,
    loading,
    markAsRead,
    archiveNotification,
    deleteNotification
  } = useNotification();

  const handleAction = async (notificationId: string, action: 'read' | 'archive' | 'delete') => {
    try {
      switch (action) {
        case 'read':
          await markAsRead(notificationId);
          break;
        case 'archive':
          await archiveNotification(notificationId);
          break;
        case 'delete':
          await deleteNotification(notificationId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} notification:`, error);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 480,
          overflow: 'auto'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Notifications</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider />

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      ) : notifications.length > 0 ? (
        <List disablePadding>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.status === 'unread' 
                    ? 'action.hover' 
                    : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleAction(notification.id, 'archive')}
                    >
                      <ArchiveIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <RouterLink
                      to={notification.action_url || '#'}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      onClick={() => {
                        if (notification.status === 'unread') {
                          handleAction(notification.id, 'read');
                        }
                        onClose();
                      }}
                    >
                      {notification.title}
                    </RouterLink>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </Typography>
                    </>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No notifications
          </Typography>
        </Box>
      )}

      {notifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            size="small"
            component={RouterLink}
            to="/notifications"
            onClick={onClose}
          >
            View All Notifications
          </Button>
        </Box>
      )}
    </Popover>
  );
};

export default NotificationPopover;

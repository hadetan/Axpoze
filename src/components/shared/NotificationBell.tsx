import React, { useState } from 'react';
import { 
  IconButton, Badge, Tooltip,
  useTheme 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationPopover from './NotificationPopover';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { unreadCount } = useNotification();
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={unreadCount ? `${unreadCount} new notifications` : 'No new notifications'}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            animation: unreadCount ? `pulse 2s ${theme.transitions.easing.easeInOut} infinite` : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
      />
    </>
  );
};

export default NotificationBell;

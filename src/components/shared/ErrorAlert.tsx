import React from 'react';
import { Alert, AlertTitle, Collapse, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  action?: React.ReactNode;
  sx?: object; // Add support for sx prop
  onError?: (error: string) => void; // Add error callback
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  onClose, 
  severity = 'error',
  title,
  action
}) => {
  return (
    <Collapse in={!!error}>
      <Alert
        severity={severity}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {action}
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        }
        sx={{ mb: 2 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {error}
      </Alert>
    </Collapse>
  );
};

export default ErrorAlert;

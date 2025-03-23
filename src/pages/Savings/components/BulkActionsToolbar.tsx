import React from 'react';
import {
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

interface BulkActionsToolbarProps {
  numSelected: number;
  onDelete: () => void;
  onClearSelection: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  numSelected,
  onDelete,
  onClearSelection
}) => {
  if (numSelected === 0) return null;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor: (theme) =>
          alpha(
            theme.palette.primary.main,
            theme.palette.action.activatedOpacity
          ),
        borderRadius: 1,
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        color="inherit"
        variant="subtitle1"
        component="div"
      >
        {numSelected} selected
      </Typography>
      <Stack direction="row" spacing={1}>
        <Tooltip title="Delete">
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear selection">
          <IconButton onClick={onClearSelection}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Toolbar>
  );
};

export default BulkActionsToolbar;

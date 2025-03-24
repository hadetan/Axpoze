import { SxProps } from '@mui/material';

export const authStyles: Record<string, SxProps> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4,
  },
  paper: {
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    bgcolor: 'background.paper',
  },
  avatar: {
    m: 1,
    bgcolor: 'primary.main',
  },
  form: {
    width: '100%',
    mt: 3,
  },
  submit: {
    mt: 2,
    mb: 2,
  },
};

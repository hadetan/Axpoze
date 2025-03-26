import React from 'react';
import {
  Paper,
  Stack,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import AnimationIcon from '@mui/icons-material/Animation';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAnimation } from '../../../contexts/AnimationContext';

const PreferencesTab: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const { animationsEnabled, toggleAnimations, loading, error } = useAnimation();
  
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Theme Section */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <PaletteIcon color="primary" />
              <Typography variant="h6">Appearance</Typography>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                />
              }
              label="Dark Mode"
            />
          </Box>

          <Divider />

          {/* Animation Section */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <AnimationIcon color="primary" />
              <Typography variant="h6">Animations</Typography>
            </Stack>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={animationsEnabled}
                  onChange={toggleAnimations}
                  disabled={loading}
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  Enable Animations
                  {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Toggle interface animations and transitions
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PreferencesTab;
import React from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../theme/colors';

const ThemeSwitch: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ p: 2 }}>
      <Typography 
        variant="subtitle2" 
        gutterBottom
        sx={{ color: colors.primary.main }}
      >
        Theme Mode
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={mode === 'dark'}
            onChange={toggleTheme}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: colors.primary.main,
                '&:hover': {
                  bgcolor: colors.primary.alpha[8]
                }
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                bgcolor: colors.primary.light
              }
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {mode === 'dark' ? 
              <DarkModeIcon sx={{ color: colors.primary.main }} /> : 
              <LightModeIcon sx={{ color: colors.primary.main }} />
            }
            <Typography sx={{ color: colors.primary.main }}>
              {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default ThemeSwitch;

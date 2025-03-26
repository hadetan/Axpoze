import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { useAuth } from './AuthContext';
import { themeService } from '../services/theme.service';
import { alpha } from '@mui/material/styles';
import { colors } from '../theme/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Initialize from localStorage or default to 'dark'
    return (localStorage.getItem('themeMode') as ThemeMode) || 'dark';
  });
  const { authState } = useAuth();

  useEffect(() => {
    const loadThemePreference = async () => {
      if (authState.user?.id) {
        try {
          const preference = await themeService.getThemePreference(authState.user.id);
          setMode(preference);
          localStorage.setItem('themeMode', preference);
        } catch (error) {
          console.error('Failed to load theme preference:', error);
        }
      }
    };

    loadThemePreference();
  }, [authState.user?.id]);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);

    if (authState.user?.id) {
      try {
        await themeService.updateThemePreference(authState.user.id, newMode);
      } catch (error) {
        console.error('Failed to update theme preference:', error);
        // Revert changes if update fails
        setMode(mode);
        localStorage.setItem('themeMode', mode);
      }
    }
  };

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
      },
      secondary: {
        main: '#f50057',
      },
      success: {
        main: '#4caf50',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            border: `1px solid ${mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

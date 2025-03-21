import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/expenses', label: 'Expenses', icon: <ReceiptIcon /> },
  { path: '/savings', label: 'Savings', icon: <SavingsIcon /> },
  { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
];

const MainLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Money Manager
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {NAV_ITEMS.map(({ path, label, icon }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={path}
                  selected={location.pathname === path}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* This creates space for the AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

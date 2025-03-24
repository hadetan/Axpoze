import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';
import PersonIcon from '@mui/icons-material/Person';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/expenses', label: 'Expenses', icon: <ReceiptIcon /> },
  { path: '/savings', label: 'Savings', icon: <SavingsIcon /> },
  { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' } // Only show on mobile
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
        showLabels
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            value={item.path}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;

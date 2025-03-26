import React from 'react';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';
import PersonIcon from '@mui/icons-material/Person';
import Dock from '../shared/Dock';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { 
      icon: <DashboardIcon fontSize="small" />, 
      label: 'Dashboard',
      path: '/',
      onClick: () => navigate('/') 
    },
    { 
      icon: <ReceiptIcon fontSize="small" />, 
      label: 'Expenses',
      path: '/expenses',
      onClick: () => navigate('/expenses') 
    },
    { 
      icon: <SavingsIcon fontSize="small" />, 
      label: 'Savings',
      path: '/savings',
      onClick: () => navigate('/savings') 
    },
    { 
      icon: <PersonIcon fontSize="small" />, 
      label: 'Profile',
      path: '/profile',
      onClick: () => navigate('/profile') 
    },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
      }}
    >
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={65}
      />
    </Box>
  );
};

export default MobileBottomNav;

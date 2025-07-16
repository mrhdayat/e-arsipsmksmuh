import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const drawerWidth = 260;

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar drawerWidth={drawerWidth} />
      <Box 
        component="main" 
        sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
        }}
      >
        <Toolbar /> 
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
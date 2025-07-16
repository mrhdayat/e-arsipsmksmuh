import React, { useMemo } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box, Divider } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Dashboard, 
    Mail, 
    ArrowUpward, 
    Settings, 
    Logout, 
    Assessment, 
    History as HistoryIcon,
    Article // Menggunakan alias untuk menghindari konflik
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo-muhammadiyah.png';

const allNavItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Surat Masuk', icon: <Mail />, path: '/surat-masuk' },
  { text: 'Surat Keluar', icon: <ArrowUpward />, path: '/surat-keluar' },
  { text: 'Laporan', icon: <Assessment />, path: '/laporan', roles: ['ADMIN_TU'] },
  { text: 'Jejak Audit', icon: <HistoryIcon />, path: '/audit-log', roles: ['ADMIN_TU'] },
  { text: 'Template Surat', icon: <Article />, path: '/template-surat', roles: ['ADMIN_TU'] }, // Menggunakan nama alias
  { text: 'Pengaturan', icon: <Settings />, path: '/pengaturan', roles: ['ADMIN_TU'] },
];

const Sidebar = ({ drawerWidth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleNavItems = useMemo(() => {
    return allNavItems.filter(item => {
      return !item.roles || item.roles.includes(user.role);
    });
  }, [user.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, gap: 1 }}>
        <img src={logo} alt="Logo" style={{ width: 60 }}/>
        <Box textAlign="center">
            <Typography variant="h6" noWrap component="div" sx={{ lineHeight: 1.2 }}>
            E-ARSIP SURAT
            </Typography>
            <Typography variant="caption">SMKS Muhammadiyah Satui</Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}/>
      <List>
        {visibleNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={NavLink} to={item.path} className="sidebar-nav-link" end={item.path === '/'}>
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}/>
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="bold">{user?.name}</Typography>
            <Typography variant="caption">{user?.role === 'ADMIN_TU' ? 'Admin Tata Usaha' : 'Kepala Sekolah'}</Typography>
        </Box>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ backgroundColor: 'rgba(255,0,0,0.2)'}}>
            <ListItemIcon sx={{ color: 'white' }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            backgroundColor: '#0D47A1', 
            color: 'white' 
        },
      }}
    >
        {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
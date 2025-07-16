import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import KepsekDashboard from './KepsekDashboard';
import { Box, CircularProgress } from '@mui/material';

const DashboardPage = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Pilih komponen dashboard berdasarkan peran user
    if (user.role === 'ADMIN_TU') {
        return <AdminDashboard />;
    }
    
    if (user.role === 'KEPALA_SEKOLAH') {
        return <KepsekDashboard />;
    }

    // Fallback jika peran tidak dikenali
    return <Typography>Peran pengguna tidak dikenali.</Typography>;
};

export default DashboardPage;
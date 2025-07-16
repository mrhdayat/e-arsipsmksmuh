import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Mail, ArrowUpward, EventNote, Today, Visibility } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
        <Box sx={{ p: 2, bgcolor: color, color: 'white', borderRadius: '50%', mr: 2 }}><>{icon}</></Box>
        <Box>
            <Typography color="text.secondary">{title}</Typography>
            <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
        </Box>
    </Card>
);

const KepsekDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/stats/dashboard');
                setStats(response.data);
            } catch (err) {
                setError('Gagal mengambil data statistik.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Dashboard Monitoring</Typography>
            <Typography variant="h6" gutterBottom>Selamat Datang, {user.name}</Typography>
            
            <Grid container spacing={3} mb={4} mt={1}>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Total Surat Masuk" value={stats.totalSuratMasuk} icon={<Mail />} color="#2196f3" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Total Surat Keluar" value={stats.totalSuratKeluar} icon={<ArrowUpward />} color="#ff9800" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Masuk Bulan Ini" value={stats.suratMasukBulanIni} icon={<EventNote />} color="#4caf50" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Keluar Bulan Ini" value={stats.suratKeluarBulanIni} icon={<Today />} color="#f44336" /></Grid>
            </Grid>
            
            <Card>
                <CardContent>
                    <Typography variant="h6">Statistik Surat 6 Bulan Terakhir</Typography>
                    <Box sx={{ height: 350, mt: 3 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false}/>
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Surat Masuk" fill="#2196f3" />
                                <Bar dataKey="Surat Keluar" fill="#ff9800" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default KepsekDashboard;
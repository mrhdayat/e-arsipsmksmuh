import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Button, Paper, List, ListItem, ListItemText, ListItemIcon, Divider, Chip } from '@mui/material';
import { Mail, ArrowUpward, NoteAdd, PostAdd, Inbox, Outbox } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import api from '../services/api';

// Aktifkan plugin untuk format waktu "fromNow"
dayjs.extend(relativeTime);
dayjs.locale('id');

const StatCard = ({ title, value, icon, color }) => (
    <Card component={Paper} elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%', borderRadius: 2 }}>
        <Box sx={{ p: 2, bgcolor: color, color: 'white', borderRadius: '50%', mr: 2, display: 'flex', alignItems: 'center' }}>
            {icon}
        </Box>
        <Box>
            <Typography color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{title}</Typography>
            <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
        </Box>
    </Card>
);

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Ambil semua data yang dibutuhkan secara bersamaan
                const [statsRes, activityRes] = await Promise.all([
                    api.get('/api/stats/dashboard'),
                    api.get('/api/stats/recent-activity')
                ]);
                setData({
                    stats: statsRes.data,
                    activity: activityRes.data
                });
            } catch (err) {
                setError('Gagal memuat data dashboard. Pastikan server backend berjalan.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const { stats, activity } = data;

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Dashboard Admin</Typography>
            
            {/* Baris Kartu Statistik */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Total Surat Masuk" value={stats.totalSuratMasuk} icon={<Inbox />} color="#2196f3" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Total Surat Keluar" value={stats.totalSuratKeluar} icon={<Outbox />} color="#ff9800" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Masuk Bulan Ini" value={stats.suratMasukBulanIni} icon={<Mail />} color="#4caf50" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Keluar Bulan Ini" value={stats.suratKeluarBulanIni} icon={<ArrowUpward />} color="#f44336" /></Grid>
            </Grid>
            
            {/* Layout Utama Dua Kolom */}
            <Grid container spacing={3}>
                {/* Kolom Kiri: Aktivitas Terbaru */}
                <Grid item xs={12} lg={8}>
                    <Paper component={Card} elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Aktivitas Surat Terbaru</Typography>
                        <List dense>
                            {activity.recentMasuk.map((surat, index) => (
                                <React.Fragment key={`masuk-${surat.id}`}>
                                    <ListItem>
                                        <ListItemIcon><Mail color="primary" /></ListItemIcon>
                                        <ListItemText 
                                            primary={<Typography variant="body1"><strong>{surat.perihal}</strong></Typography>}
                                            secondary={`Dari: ${surat.pengirim}`} 
                                        />
                                        <Chip label={dayjs(surat.createdAt).fromNow()} size="small" />
                                    </ListItem>
                                    {index < activity.recentMasuk.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                             {activity.recentKeluar.map((surat, index) => (
                                <React.Fragment key={`keluar-${surat.id}`}>
                                    <ListItem>
                                        <ListItemIcon><ArrowUpward sx={{color: '#ff9800'}} /></ListItemIcon>
                                        <ListItemText 
                                            primary={<Typography variant="body1"><strong>{surat.perihal}</strong></Typography>}
                                            secondary={`Tujuan: ${surat.tujuan}`} 
                                        />
                                        <Chip label={dayjs(surat.createdAt).fromNow()} size="small" />
                                    </ListItem>
                                    {index < activity.recentKeluar.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Kolom Kanan: Akses Cepat */}
                <Grid item xs={12} lg={4}>
                     <Paper component={Card} elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Akses Cepat</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button component={Link} to="/surat-masuk" variant="contained" startIcon={<NoteAdd />} size="large">
                                Tambah Surat Masuk
                            </Button>
                            <Button component={Link} to="/surat-keluar" variant="contained" color="secondary" startIcon={<PostAdd />} size="large">
                                Tambah Surat Keluar
                            </Button>
                        </Box>
                     </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
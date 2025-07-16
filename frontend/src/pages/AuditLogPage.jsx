import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { Table } from 'antd';
import dayjs from 'dayjs';
import api from '../services/api';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/api/audit-log');
            setLogs(response.data);
        } catch (err) {
            setError('Gagal mengambil data jejak audit.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const columns = useMemo(() => [
        {
            title: 'Waktu',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 200,
            render: (text) => dayjs(text).format('DD MMM YYYY, HH:mm:ss'),
        },
        {
            title: 'Nama Pengguna',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Peran',
            dataIndex: 'userRole',
            key: 'userRole',
            render: (role) => (
                <Chip 
                    label={role === 'ADMIN_TU' ? 'Admin TU' : 'Kepala Sekolah'}
                    color={role === 'ADMIN_TU' ? 'primary' : 'success'}
                    size="small"
                />
            )
        },
        {
            title: 'Aksi',
            dataIndex: 'action',
            key: 'action',
        },
        {
            title: 'Detail',
            dataIndex: 'details',
            key: 'details',
        },
    ], []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Jejak Audit Sistem</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Menampilkan 200 aktivitas terakhir yang terekam di dalam sistem.
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ '& .ant-table-wrapper': { border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' } }}>
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['20', '50', '100'] }}
                />
            </Box>
        </Box>
    );
};

export default AuditLogPage;
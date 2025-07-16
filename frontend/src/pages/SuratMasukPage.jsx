import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button as MuiButton, IconButton, CircularProgress, Alert, Popover, Grid, FormControl, InputLabel, Select, MenuItem, Divider, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete, Snackbar } from '@mui/material';
import { Add, Edit, Visibility, Delete, DeleteSweep, FilterList } from '@mui/icons-material';
import { Table, Space, Popconfirm } from 'antd';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

const suratSchema = z.object({
  nomorAgenda: z.string().min(1, 'Nomor agenda wajib diisi'),
  nomorSurat: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggalMasuk: z.instanceof(dayjs, { message: 'Tanggal masuk tidak valid' }),
  tanggalSurat: z.instanceof(dayjs, { message: 'Tanggal surat tidak valid' }),
  pengirim: z.string().min(1, 'Pengirim wajib diisi'),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  jenisSuratId: z.string().min(1, 'Jenis surat wajib dipilih'),
  file: z.any().refine(files => !files || files.length > 0, 'File wajib diunggah untuk surat baru.').optional(),
});

const SuratMasukPage = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [jenisSuratList, setJenisSuratList] = useState([]);

    const [filters, setFilters] = useState({ startDate: null, endDate: null, jenisSuratId: '' });
    const [activeFilters, setActiveFilters] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);

    const [openForm, setOpenForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSurat, setCurrentSurat] = useState(null);

    const [selectionModel, setSelectionModel] = useState([]);
    const [openBulkConfirm, setOpenBulkConfirm] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const { control, handleSubmit, register, reset, formState: { errors } } = useForm({
      resolver: zodResolver(suratSchema),
    });
    
    const isAdmin = useMemo(() => user?.role === 'ADMIN_TU', [user]);

    const fetchData = useCallback(async (currentFilters) => {
        try {
            setLoading(true); setError('');
            const params = new URLSearchParams();
            if (currentFilters.startDate) params.append('startDate', currentFilters.startDate.startOf('day').toISOString());
            if (currentFilters.endDate) params.append('endDate', currentFilters.endDate.endOf('day').toISOString());
            if (currentFilters.jenisSuratId) params.append('jenisSuratId', currentFilters.jenisSuratId);

            const [suratRes, jenisSuratRes] = await Promise.all([
                api.get(`/api/surat-masuk?${params.toString()}`),
                api.get('/api/jenis-surat'),
            ]);
            
            setRows(suratRes.data);
            setJenisSuratList(jenisSuratRes.data);
            setActiveFilters(currentFilters);
        } catch (err) {
            setError('Gagal mengambil data dari server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters);
    }, [fetchData]);

    const handleFilterOpen = (event) => setAnchorEl(event.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleDateChange = (name, newValue) => setFilters({ ...filters, [name]: newValue });
    
    const handleApplyFilter = () => {
        fetchData(filters);
        handleFilterClose();
    };

    const handleResetFilter = () => {
        const initialFilters = { startDate: null, endDate: null, jenisSuratId: '' };
        setFilters(initialFilters);
        fetchData(initialFilters);
        handleFilterClose();
    };

    const handleOpenForm = (surat = null) => {
        if (surat) {
            setIsEditing(true);
            setCurrentSurat(surat);
            reset({
                ...surat,
                tanggalMasuk: dayjs(surat.tanggalMasuk),
                tanggalSurat: dayjs(surat.tanggalSurat),
            });
        } else {
            setIsEditing(false);
            setCurrentSurat(null);
            reset({
                nomorAgenda: '', nomorSurat: '', tanggalMasuk: dayjs(), tanggalSurat: dayjs(), pengirim: '', perihal: '', jenisSuratId: '', file: null
            });
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => setOpenForm(false);

    const onSubmit = async (data) => {
        const formData = new FormData();
        // Hanya append file jika ada di form data
        if (data.file && data.file.length > 0) {
            formData.append('file', data.file[0]);
        }
        // Append data lainnya
        Object.keys(data).forEach(key => {
            if (key !== 'file') {
                const value = data[key];
                if (value instanceof dayjs) {
                    formData.append(key, value.toISOString());
                } else {
                    formData.append(key, value);
                }
            }
        });

        try {
            if (isEditing) {
                await api.put(`/api/surat-masuk/${currentSurat.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSnackbar({ open: true, message: 'Surat berhasil diperbarui!', severity: 'success' });
            } else {
                await api.post('/api/surat-masuk', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSnackbar({ open: true, message: 'Surat berhasil ditambahkan!', severity: 'success' });
            }
            handleCloseForm();
            fetchData(filters);
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Terjadi kesalahan', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/surat-masuk/${id}`);
            setSnackbar({ open: true, message: 'Surat berhasil dihapus!', severity: 'success' });
            fetchData(filters);
        } catch (err) {
            setSnackbar({ open: true, message: 'Gagal menghapus surat.', severity: 'error' });
        }
    };

    const handleConfirmBulkDelete = async () => {
        try {
            const response = await api.post('/api/surat-masuk/bulk-delete', { ids: selectionModel });
            setSnackbar({ open: true, message: response.data.message, severity: 'success' });
            fetchData(filters);
            setSelectionModel([]);
        } catch (err) {
            setSnackbar({ open: true, message: 'Gagal menghapus surat secara massal.', severity: 'error' });
        } finally {
            setOpenBulkConfirm(false);
        }
    };

    const columns = useMemo(() => [
        { title: 'No. Agenda', dataIndex: 'nomorAgenda', key: 'nomorAgenda', width: 120, sorter: (a, b) => a.nomorAgenda.localeCompare(b.nomorAgenda) },
        { title: 'No. Surat', dataIndex: 'nomorSurat', key: 'nomorSurat', sorter: (a, b) => a.nomorSurat.localeCompare(b.nomorSurat) },
        { title: 'Pengirim', dataIndex: 'pengirim', key: 'pengirim', sorter: (a, b) => a.pengirim.localeCompare(b.pengirim) },
        { title: 'Perihal', dataIndex: 'perihal', key: 'perihal' },
        { 
          title: 'Tgl. Masuk', 
          dataIndex: 'tanggalMasuk', 
          key: 'tanggalMasuk', 
          width: 160,
          render: (text) => dayjs(text).format('DD MMMM YYYY'),
          sorter: (a, b) => dayjs(a.tanggalMasuk).unix() - dayjs(b.tanggalMasuk).unix(),
        },
        {
          title: 'Aksi',
          key: 'action',
          width: 150,
          render: (_, record) => (
            <Space size="middle">
              <IconButton size="small" onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}${record.fileUrl}`, '_blank')}><Visibility /></IconButton>
              {isAdmin && (
                <>
                  <IconButton size="small" color="secondary" onClick={() => handleOpenForm(record)}><Edit /></IconButton>
                  <Popconfirm title="Hapus surat ini?" onConfirm={() => handleDelete(record.id)} okText="Ya" cancelText="Tidak">
                    <IconButton size="small" color="error"><Delete /></IconButton>
                  </Popconfirm>
                </>
              )}
            </Space>
          ),
        },
    ], [isAdmin, fetchData]);

    const rowSelection = {
        onChange: (selectedRowKeys) => setSelectionModel(selectedRowKeys),
        selectedRowKeys: selectionModel,
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Manajemen Surat Masuk</Typography>
                {isAdmin && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <MuiButton variant="outlined" startIcon={<FilterList />} onClick={handleFilterOpen}>Filter</MuiButton>
                        {selectionModel.length > 0 && (
                            <MuiButton variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={() => setOpenBulkConfirm(true)}>
                                Hapus ({selectionModel.length})
                            </MuiButton>
                        )}
                        <MuiButton variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>
                            Tambah Surat
                        </MuiButton>
                    </Box>
                )}
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {activeFilters.startDate && <Chip label={`Dari: ${activeFilters.startDate.format('DD/MM/YY')}`} onDelete={handleResetFilter} size="small" />}
                {activeFilters.endDate && <Chip label={`Sampai: ${activeFilters.endDate.format('DD/MM/YY')}`} onDelete={handleResetFilter} size="small" />}
                {activeFilters.jenisSuratId && <Chip label={`Jenis: ${jenisSuratList.find(j => j.id === activeFilters.jenisSuratId)?.nama || ''}`} onDelete={handleResetFilter} size="small" />}
            </Stack>

            <Popover
                open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ p: 2, width: 300 }}>
                    <Typography variant="h6" gutterBottom>Filter Surat</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><DatePicker label="Tanggal Mulai" value={filters.startDate} onChange={(v) => handleDateChange('startDate', v)} sx={{ width: '100%' }} /></Grid>
                        <Grid item xs={12}><DatePicker label="Tanggal Selesai" value={filters.endDate} onChange={(v) => handleDateChange('endDate', v)} sx={{ width: '100%' }} /></Grid>
                        <Grid item xs={12}>
                             <FormControl fullWidth>
                                <InputLabel>Jenis Surat</InputLabel>
                                <Select name="jenisSuratId" value={filters.jenisSuratId} label="Jenis Surat" onChange={handleFilterChange}>
                                    <MenuItem value=""><em>Semua</em></MenuItem>
                                    {jenisSuratList.map(item => <MenuItem key={item.id} value={item.id}>{item.nama}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <MuiButton onClick={handleResetFilter}>Reset</MuiButton>
                                <MuiButton variant="contained" onClick={handleApplyFilter}>Terapkan</MuiButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Popover>
            
            <Box sx={{ '& .ant-table-wrapper': { border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' } }}>
                <Table
                    columns={columns}
                    dataSource={rows}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                    rowSelection={isAdmin ? { type: 'checkbox', ...rowSelection } : undefined}
                />
            </Box>

            <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
                <DialogTitle>{isEditing ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <DialogContent>
                    <Controller name="nomorAgenda" control={control} render={({ field }) => <TextField {...field} label="Nomor Agenda" fullWidth margin="dense" error={!!errors.nomorAgenda} helperText={errors.nomorAgenda?.message} autoFocus />}/>
                    <Controller name="nomorSurat" control={control} render={({ field }) => <TextField {...field} label="Nomor Surat" fullWidth margin="dense" error={!!errors.nomorSurat} helperText={errors.nomorSurat?.message} />}/>
                    <Controller name="tanggalMasuk" control={control} render={({ field }) => <DatePicker {...field} label="Tanggal Masuk" sx={{ width: '100%', mt: 1 }} slotProps={{ textField: { error: !!errors.tanggalMasuk, helperText: errors.tanggalMasuk?.message } }} />}/>
                    <Controller name="tanggalSurat" control={control} render={({ field }) => <DatePicker {...field} label="Tanggal Surat" sx={{ width: '100%', mt: 2 }} slotProps={{ textField: { error: !!errors.tanggalSurat, helperText: errors.tanggalSurat?.message } }} />}/>
                    <Controller name="pengirim" control={control} render={({ field }) => <TextField {...field} label="Pengirim" fullWidth margin="dense" error={!!errors.pengirim} helperText={errors.pengirim?.message} />}/>
                    <Controller name="perihal" control={control} render={({ field }) => <TextField {...field} label="Perihal" fullWidth margin="dense" multiline rows={3} error={!!errors.perihal} helperText={errors.perihal?.message} />}/>
                    <Controller name="jenisSuratId" control={control} render={({ field }) => (
                      <Autocomplete
                        options={jenisSuratList}
                        getOptionLabel={(option) => option.nama}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                        value={jenisSuratList.find(js => js.id === field.value) || null}
                        renderInput={(params) => <TextField {...params} label="Jenis Surat" margin="dense" error={!!errors.jenisSuratId} helperText={errors.jenisSuratId?.message} />}
                      />
                    )}/>
                    <MuiButton variant="outlined" component="label" sx={{ mt: 2 }}>
                        {isEditing ? 'Ganti File (Opsional)' : 'Upload File PDF'}
                        <input type="file" hidden accept=".pdf" {...register('file')} />
                    </MuiButton>
                    {errors.file && <Typography color="error.main" variant="caption">{errors.file.message}</Typography>}
                  </DialogContent>
                  <DialogActions>
                    <MuiButton onClick={handleCloseForm}>Batal</MuiButton>
                    <MuiButton type="submit" variant="contained">Simpan</MuiButton>
                  </DialogActions>
                </form>
            </Dialog>
      
            <ConfirmationDialog
                open={openBulkConfirm}
                onClose={() => setOpenBulkConfirm(false)}
                onConfirm={handleConfirmBulkDelete}
                title="Konfirmasi Hapus Massal"
                content={`Apakah Anda yakin ingin menghapus ${selectionModel.length} surat masuk yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                  {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SuratMasukPage;
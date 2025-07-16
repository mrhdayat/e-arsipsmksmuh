import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button as MuiButton, IconButton, CircularProgress, Alert, Popover, Grid, FormControl, InputLabel, Select, MenuItem, Divider, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete, Snackbar } from '@mui/material';
import { Add, Edit, Visibility, Delete, DeleteSweep, FilterList } from '@mui/icons-material';
import { Table, Space, Popconfirm } from 'antd';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Editor } from '@tinymce/tinymce-react';
import dayjs from 'dayjs';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Skema diperbarui dengan field 'isi'
const suratKeluarSchema = z.object({
  nomorAgenda: z.string().min(1, 'Nomor agenda wajib diisi'),
  nomorSurat: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggalKeluar: z.instanceof(dayjs, { message: 'Tanggal keluar tidak valid' }),
  tujuan: z.string().min(1, 'Tujuan surat wajib diisi'),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  isi: z.string().optional(),
  jenisSuratId: z.string().min(1, 'Jenis surat wajib dipilih'),
  file: z.any().optional(),
});

const SuratKeluarPage = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [jenisSuratList, setJenisSuratList] = useState([]);
    const [templates, setTemplates] = useState([]);

    // State untuk Filter
    const [filters, setFilters] = useState({ startDate: null, endDate: null, jenisSuratId: '' });
    const [activeFilters, setActiveFilters] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);

    // State untuk Form Utama
    const [openForm, setOpenForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSurat, setCurrentSurat] = useState(null);

    // State untuk Aksi Massal
    const [selectionModel, setSelectionModel] = useState([]);
    const [openBulkConfirm, setOpenBulkConfirm] = useState(false);

    // State untuk Notifikasi
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // --- STATE BARU UNTUK GENERATOR TEMPLATE ---
    const [generatorOpen, setGeneratorOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [templateData, setTemplateData] = useState({});

    const { control, handleSubmit, register, reset, setValue, formState: { errors } } = useForm({
      resolver: zodResolver(suratKeluarSchema),
    });
    
    const isAdmin = useMemo(() => user?.role === 'ADMIN_TU', [user]);

    const fetchData = useCallback(async (currentFilters) => {
        try {
            setLoading(true); setError('');
            const params = new URLSearchParams();
            if (currentFilters.startDate) params.append('startDate', currentFilters.startDate.startOf('day').toISOString());
            if (currentFilters.endDate) params.append('endDate', currentFilters.endDate.endOf('day').toISOString());
            if (currentFilters.jenisSuratId) params.append('jenisSuratId', currentFilters.jenisSuratId);

            const [suratRes, jenisSuratRes, templatesRes] = await Promise.all([
                api.get(`/api/surat-keluar?${params.toString()}`),
                api.get('/api/jenis-surat'),
                api.get('/api/templates'),
            ]);
            
            setRows(suratRes.data);
            setJenisSuratList(jenisSuratRes.data);
            setTemplates(templatesRes.data);
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

    // --- SEMUA FUNGSI HANDLER ---
    const handleOpenForm = (surat = null) => {
        if (surat) {
          setIsEditing(true); setCurrentSurat(surat);
          reset({ ...surat, tanggalKeluar: dayjs(surat.tanggalKeluar), isi: surat.isi || '' });
        } else {
          setIsEditing(false); setCurrentSurat(null);
          reset({ nomorAgenda: '', nomorSurat: '', tanggalKeluar: dayjs(), tujuan: '', perihal: '', isi: '', jenisSuratId: '', file: null });
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => setOpenForm(false);
  
    const onSubmit = async (data) => {
        // Sekarang kita tidak lagi mengirim FormData, tapi JSON biasa
        try {
            if (isEditing) {
                // Logika update bisa disesuaikan nanti, kita fokus pada create
                // await api.put(`/api/surat-keluar/${currentSurat.id}`, data);
                // setSnackbar({ open: true, message: 'Surat keluar berhasil diperbarui!', severity: 'success' });
            } else {
                // Kirim data JSON ke backend untuk digenerate PDF-nya
                await api.post('/api/surat-keluar', data);
                setSnackbar({ open: true, message: 'Surat berhasil digenerate dan disimpan!', severity: 'success' });
            }
            handleCloseForm();
            fetchData(filters);
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Terjadi kesalahan', severity: 'error' });
        }
    };
  
    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/surat-keluar/${id}`);
            setSnackbar({ open: true, message: 'Surat keluar berhasil dihapus!', severity: 'success' });
            fetchData(filters);
        } catch (err) {
            setSnackbar({ open: true, message: 'Gagal menghapus surat.', severity: 'error' });
        }
    };

    const handleConfirmBulkDelete = async () => {
        try {
            const response = await api.post('/api/surat-keluar/bulk-delete', { ids: selectionModel });
            setSnackbar({ open: true, message: response.data.message, severity: 'success' });
            fetchData(filters);
            setSelectionModel([]);
        } catch (err) {
            setSnackbar({ open: true, message: 'Gagal menghapus surat secara massal.', severity: 'error' });
        } finally {
            setOpenBulkConfirm(false);
        }
    };

    const handleFilterOpen = (event) => setAnchorEl(event.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleDateChange = (name, newValue) => setFilters({ ...filters, [name]: newValue });
    const handleApplyFilter = () => { fetchData(filters); handleFilterClose(); };
    const handleResetFilter = () => {
        const initialFilters = { startDate: null, endDate: null, jenisSuratId: '' };
        setFilters(initialFilters);
        fetchData(initialFilters);
        handleFilterClose();
    };

    // --- LOGIKA BARU UNTUK GENERATOR TEMPLATE ---
    const handleTemplateSelect = (template) => {
        if (!template) return;
        if (template.placeholders && template.placeholders.length > 0) {
            setActiveTemplate(template);
            setTemplateData({});
            setGeneratorOpen(true);
        } else {
            setValue('perihal', template.subjek);
            setValue('isi', template.isi);
        }
    };
    const handleTemplateDataChange = (e) => setTemplateData({ ...templateData, [e.target.name]: e.target.value });
    const handleGenerateSurat = () => {
        let finalIsi = activeTemplate.isi;
        for (const key in templateData) {
            finalIsi = finalIsi.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), templateData[key] || `{{${key}}}`);
        }
        setValue('perihal', activeTemplate.subjek);
        setValue('isi', finalIsi);
        setGeneratorOpen(false);
    };

    const columns = useMemo(() => [
        { title: 'No. Agenda', dataIndex: 'nomorAgenda', key: 'nomorAgenda', width: 120 },
        { title: 'No. Surat', dataIndex: 'nomorSurat', key: 'nomorSurat' },
        { title: 'Tujuan', dataIndex: 'tujuan', key: 'tujuan' },
        { title: 'Perihal', dataIndex: 'perihal', key: 'perihal', flex: 1 },
        { title: 'Tgl. Keluar', dataIndex: 'tanggalKeluar', key: 'tanggalKeluar', render: (text) => dayjs(text).format('DD MMMM YYYY') },
        {
          title: 'Aksi', key: 'action', width: 150,
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

    const rowSelection = { onChange: (keys) => setSelectionModel(keys), selectedRowKeys: selectionModel };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Manajemen Surat Keluar</Typography>
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

            <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleFilterClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
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
                <Table columns={columns} dataSource={rows} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} rowSelection={isAdmin ? { type: 'checkbox', ...rowSelection } : undefined} />
            </Box>

            <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
                <DialogTitle>{isEditing ? 'Edit Surat Keluar' : 'Buat Surat Keluar Baru'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Autocomplete
                            options={templates}
                            getOptionLabel={(option) => option.nama}
                            onChange={(event, newValue) => {
                                if (newValue) handleTemplateSelect(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} label="Gunakan Template (Opsional)" margin="normal" />}
                            sx={{ mb: 1 }}
                        />
                        <Controller name="nomorAgenda" control={control} render={({ field }) => <TextField {...field} label="Nomor Agenda" fullWidth margin="dense" error={!!errors.nomorAgenda} helperText={errors.nomorAgenda?.message} autoFocus />}/>
                        <Controller name="nomorSurat" control={control} render={({ field }) => <TextField {...field} label="Nomor Surat" fullWidth margin="dense" error={!!errors.nomorSurat} helperText={errors.nomorSurat?.message} />}/>
                        <Controller name="tanggalKeluar" control={control} render={({ field }) => <DatePicker {...field} label="Tanggal Keluar" sx={{ width: '100%', mt: 1 }} slotProps={{ textField: { error: !!errors.tanggalKeluar, helperText: errors.tanggalKeluar?.message } }} />}/>
                        <Controller name="tujuan" control={control} render={({ field }) => <TextField {...field} label="Tujuan" fullWidth margin="dense" error={!!errors.tujuan} helperText={errors.tujuan?.message} />}/>
                        <Controller name="perihal" control={control} render={({ field }) => <TextField {...field} label="Perihal" fullWidth margin="dense" error={!!errors.perihal} helperText={errors.perihal?.message} />}/>
                        <Controller name="jenisSuratId" control={control} render={({ field }) => (
                            <Autocomplete options={jenisSuratList} getOptionLabel={(o) => o.nama} isOptionEqualToValue={(o, v) => o.id === v.id}
                                onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                                value={jenisSuratList.find(js => js.id === field.value) || null}
                                renderInput={(params) => <TextField {...params} label="Jenis Surat" margin="dense" error={!!errors.jenisSuratId} helperText={errors.jenisSuratId?.message} />}
                            />
                        )}/>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>Isi Surat</Typography>
                        <Controller
                            name="isi"
                            control={control}
                            render={({ field }) => (
                                <Editor
                                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                    value={field.value || ''}
                                    onEditorChange={(content) => field.onChange(content)}
                                    init={{ height: 400, menubar: false, plugins: 'lists link table wordcount', toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent' }}
                                />
                            )}
                        />
                        
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <MuiButton onClick={handleCloseForm}>Batal</MuiButton>
                         <MuiButton type="submit" variant="contained">Generate PDF & Simpan</MuiButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={generatorOpen} onClose={() => setGeneratorOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Isi Detail untuk Template "{activeTemplate?.nama}"</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        Silakan isi semua kolom di bawah ini untuk menghasilkan surat secara otomatis.
                    </Typography>
                    {activeTemplate?.placeholders.map(placeholder => (
                        <TextField
                            key={placeholder}
                            name={placeholder}
                            label={placeholder.replace(/_/g, ' ')}
                            fullWidth
                            margin="normal"
                            onChange={handleTemplateDataChange}
                        />
                    ))}
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <MuiButton onClick={() => setGeneratorOpen(false)}>Batal</MuiButton>
                    <MuiButton variant="contained" onClick={handleGenerateSurat}>Buat Surat</MuiButton>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog open={openBulkConfirm} onClose={() => setOpenBulkConfirm(false)} onConfirm={handleConfirmBulkDelete} title="Konfirmasi Hapus Massal" content={`Apakah Anda yakin ingin menghapus ${selectionModel.length} surat keluar yang dipilih?`} />
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default SuratKeluarPage;
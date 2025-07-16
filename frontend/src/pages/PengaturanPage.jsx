import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Paper } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Skema validasi untuk form jenis surat
const jenisSuratSchema = z.object({
  nama: z.string().min(3, 'Nama jenis surat minimal 3 karakter'),
  deskripsi: z.string().optional(),
});

const PengaturanPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk Dialog Form
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // State untuk Dialog Konfirmasi Hapus
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // State untuk Notifikasi (Snackbar)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(jenisSuratSchema),
  });
  
  const isAdmin = useMemo(() => user?.role === 'ADMIN_TU', [user]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/jenis-surat');
      setRows(response.data);
    } catch (err) {
      setError('Gagal mengambil data jenis surat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      reset({ nama: item.nama, deskripsi: item.deskripsi || '' });
    } else {
      setIsEditing(false);
      setCurrentItem(null);
      reset({ nama: '', deskripsi: '' });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/api/jenis-surat/${currentItem.id}`, data);
        setSnackbar({ open: true, message: 'Jenis surat berhasil diperbarui!', severity: 'success' });
      } else {
        await api.post('/api/jenis-surat', data);
        setSnackbar({ open: true, message: 'Jenis surat berhasil ditambahkan!', severity: 'success' });
      }
      handleCloseForm();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Terjadi kesalahan', severity: 'error' });
    }
  };
  
  const handleDeleteClick = (id) => {
      setDeleteId(id);
      setOpenConfirm(true);
  };
  
  const handleConfirmDelete = async () => {
      try {
          await api.delete(`/api/jenis-surat/${deleteId}`);
          setSnackbar({ open: true, message: 'Jenis surat berhasil dihapus!', severity: 'success' });
          fetchData();
      } catch (err) {
          setSnackbar({ open: true, message: err.response?.data?.message || 'Gagal menghapus data.', severity: 'error' });
      } finally {
          setOpenConfirm(false);
          setDeleteId(null);
      }
  };


  const columns = useMemo(() => [
    { field: 'nama', headerName: 'Nama Jenis Surat', width: 250 },
    { field: 'deskripsi', headerName: 'Deskripsi', flex: 1 },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          {isAdmin && <IconButton color="secondary" onClick={() => handleOpenForm(params.row)}><Edit /></IconButton>}
          {isAdmin && <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}><Delete /></IconButton>}
        </Box>
      ),
    },
  ], [isAdmin]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">Pengaturan Data Master</Typography>
      <Paper sx={{p: 2}}>
        <Typography variant="h6" gutterBottom>Jenis Surat</Typography>
        {isAdmin && <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => handleOpenForm()}>Tambah Jenis Surat</Button>}
        
        <Box sx={{ height: '60vh', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} loading={loading} components={{ Toolbar: GridToolbar }} />
        </Box>
      </Paper>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Jenis Surat' : 'Tambah Jenis Surat'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller name="nama" control={control} render={({ field }) => <TextField {...field} label="Nama Jenis Surat" fullWidth margin="dense" error={!!errors.nama} helperText={errors.nama?.message} autoFocus />}/>
            <Controller name="deskripsi" control={control} render={({ field }) => <TextField {...field} label="Deskripsi (Opsional)" fullWidth margin="dense" multiline rows={3} error={!!errors.deskripsi} helperText={errors.deskripsi?.message} />}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button type="submit" variant="contained">Simpan</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <ConfirmationDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        content="Apakah Anda yakin ingin menghapus jenis surat ini? Data yang terhubung mungkin akan error."
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PengaturanPage;
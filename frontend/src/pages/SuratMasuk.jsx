import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import api from '../services/api'; // Instance axios Anda

const SuratMasukPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        setLoading(true);
        const response = await api.get('/surat-masuk');
        setRows(response.data.map(d => ({ ...d, id: d.id }))); // Pastikan setiap baris punya 'id'
      } catch (error) {
        console.error("Gagal mengambil data surat masuk:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, []);

  const columns = [
    { field: 'nomorAgenda', headerName: 'No. Agenda', width: 120 },
    { field: 'nomorSurat', headerName: 'Nomor Surat', width: 200 },
    { field: 'pengirim', headerName: 'Pengirim', width: 180 },
    { field: 'perihal', headerName: 'Perihal', flex: 1 },
    {
      field: 'tanggalMasuk',
      headerName: 'Tgl. Masuk',
      width: 150,
      valueGetter: (params) => new Date(params.row.tanggalMasuk).toLocaleDateString('id-ID'),
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton color="primary"><Visibility /></IconButton>
          <IconButton color="secondary"><Edit /></IconButton>
          <IconButton color="error"><Delete /></IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Manajemen Surat Masuk
      </Typography>
      <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>
        Tambah Surat Masuk
      </Button>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          components={{ Toolbar: GridToolbar }}
          sx={{
            "& .MuiDataGrid-root": {
              border: 'none',
            },
            "& .MuiDataGrid-cell": {
              borderBottom: '1px solid #e0e0e0',
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default SuratMasukPage;
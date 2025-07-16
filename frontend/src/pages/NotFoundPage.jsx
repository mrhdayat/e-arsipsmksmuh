import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      minHeight: '100vh',
    }}
  >
    <Typography variant="h1" style={{ color: '#0D47A1' }}>
      404
    </Typography>
    <Typography variant="h6" style={{ color: 'gray' }}>
      Halaman yang Anda cari tidak ditemukan.
    </Typography>
    <Button variant="contained" component={Link} to="/" sx={{mt: 2}}>Kembali ke Dashboard</Button>
  </Box>
);

export default NotFoundPage;
import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Panggil API login di sini menggunakan axios
    console.log({ username, password });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
        <Card sx={{ minWidth: 350, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom textAlign="center" fontWeight="bold">
              Login E-Arsip Surat
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              SMKS Muhammadiyah Satui
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField label="Username" variant="outlined" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
              <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2 }}>
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
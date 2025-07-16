import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import logo from '../assets/logo-muhammadiyah.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card sx={{ minWidth: { xs: 320, sm: 400 }, boxShadow: 5, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <img src={logo} alt="Logo" style={{ width: 70, marginBottom: 16 }}/>
                <Typography variant="h5" component="h1" gutterBottom textAlign="center" fontWeight="bold">
                E-Arsip Surat Login
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                SMKS Muhammadiyah Satui
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <form onSubmit={handleLogin}>
              <TextField label="Username" variant="outlined" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
              <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2, height: 48 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit"/> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};
export default LoginPage;
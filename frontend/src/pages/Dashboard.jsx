import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MailIcon from '@mui/icons-material/Mail';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const sampleData = [
  { name: 'Jan', 'Surat Masuk': 30, 'Surat Keluar': 20 },
  { name: 'Feb', 'Surat Masuk': 45, 'Surat Keluar': 25 },
  // ... data lainnya
];

const DashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Dashboard</Typography>
      
      {/* Cards Statistik (MVPBlocks Style) */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Surat Masuk</Typography>
              <Typography variant="h4" component="div">1,250</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* ... Card lainnya */}
      </Grid>
      
      {/* Grafik (reacts.bits Chart Style) */}
      <Card>
        <CardContent>
          <Typography variant="h6">Statistik Surat per Bulan</Typography>
          <Box sx={{ height: 300, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData}>
                <XAxis dataKey="name" />
                <YAxis />
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

export default DashboardPage;
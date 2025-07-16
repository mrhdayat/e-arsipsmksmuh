import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert, Card } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import api from '../services/api';

// Import pustaka PDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LaporanPage = () => {
    const [reportType, setReportType] = useState('surat_masuk');
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generatePdf = (data, type, start, end) => {
        const doc = new jsPDF();
        const reportTitle = type === 'surat_masuk' ? 'Laporan Surat Masuk' : 'Laporan Surat Keluar';
        const dateRange = `Periode: ${start.format('DD MMMM YYYY')} - ${end.format('DD MMMM YYYY')}`;
        
        // Header Dokumen
        doc.setFontSize(18);
        doc.text(reportTitle, 14, 22);
        doc.setFontSize(11);
        doc.text(dateRange, 14, 30);
        
        // Siapkan data untuk tabel
        const tableColumn = type === 'surat_masuk'
            ? ["No.", "Tgl Masuk", "No. Surat", "Pengirim", "Perihal"]
            : ["No.", "Tgl Keluar", "No. Surat", "Tujuan", "Perihal"];
        
        const tableRows = data.map((item, index) => {
            if (type === 'surat_masuk') {
                return [
                    index + 1,
                    dayjs(item.tanggalMasuk).format('DD/MM/YYYY'),
                    item.nomorSurat,
                    item.pengirim,
                    item.perihal,
                ];
            }
            return [
                index + 1,
                dayjs(item.tanggalKeluar).format('DD/MM/YYYY'),
                item.nomorSurat,
                item.tujuan,
                item.perihal,
            ];
        });

        // Buat tabel menggunakan autoTable
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
        });

        const fileName = `${reportTitle.replace(/ /g, '_')}_${end.format('DD-MM-YYYY')}.pdf`;
        doc.save(fileName); // Simpan dan unduh PDF
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/api/laporan', {
                reportType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            if (response.data.length === 0) {
                setError('Tidak ada data yang ditemukan untuk periode dan jenis laporan yang dipilih.');
                setLoading(false);
                return;
            }

            generatePdf(response.data, reportType, startDate, endDate);

        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat laporan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Buat Laporan</Typography>
            <Paper component={Card} elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h6" gutterBottom>Pilih Kriteria Laporan</Typography>
                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Jenis Laporan</InputLabel>
                            <Select
                                value={reportType}
                                label="Jenis Laporan"
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value={'surat_masuk'}>Laporan Surat Masuk</MenuItem>
                                <MenuItem value={'surat_keluar'}>Laporan Surat Keluar</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker 
                            label="Tanggal Mulai"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            sx={{ width: '100%' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker 
                            label="Tanggal Selesai"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            sx={{ width: '100%' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            onClick={handleGenerateReport}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate & Unduh Laporan PDF'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default LaporanPage;
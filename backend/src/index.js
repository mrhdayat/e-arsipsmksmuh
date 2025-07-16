import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import suratMasukRoutes from './routes/suratMasukRoutes.js';
import suratKeluarRoutes from './routes/suratKeluarRoutes.js';
import jenisSuratRoutes from './routes/jenisSuratRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import laporanRoutes from './routes/laporanRoutes.js'; // <-- TAMBAHKAN INI
import auditLogRoutes from './routes/auditLogRoutes.js';
import templateRoutes from './routes/templateRoutes.js'; // <-- TAMBAHKAN INI

const app = express();
const PORT = process.env.PORT || 5001;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/surat-masuk', suratMasukRoutes);
app.use('/api/surat-keluar', suratKeluarRoutes);
app.use('/api/jenis-surat', jenisSuratRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/laporan', laporanRoutes); // <-- TAMBAHKAN INI
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/templates', templateRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'API E-Arsip SMKS Muhammadiyah Satui Berjalan!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});
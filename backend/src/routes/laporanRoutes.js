import express from 'express';
import { generateReport } from '../controllers/laporanController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Laporan hanya bisa diakses oleh Admin TU
router.post('/', protect, adminOnly, generateReport);

export default router;
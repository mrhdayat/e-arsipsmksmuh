import express from 'express';
import { getAllLogs } from '../controllers/auditLogController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Hanya Admin TU yang bisa melihat log
router.get('/', protect, adminOnly, getAllLogs);

export default router;
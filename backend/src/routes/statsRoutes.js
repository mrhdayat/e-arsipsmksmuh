import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/recent-activity', protect, getRecentActivity);

export default router;
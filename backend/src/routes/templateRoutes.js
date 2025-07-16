import express from 'express';
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templateController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllTemplates);
router.post('/', protect, adminOnly, createTemplate);
router.put('/:id', protect, adminOnly, updateTemplate);
router.delete('/:id', protect, adminOnly, deleteTemplate);

export default router;
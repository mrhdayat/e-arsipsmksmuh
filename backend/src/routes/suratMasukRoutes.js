import express from 'express';
import { getAll, getById, create, update, remove, bulkDelete } from '../controllers/suratMasukController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/bulk-delete', protect, adminOnly, bulkDelete);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);
router.post('/', protect, adminOnly, upload.single('file'), create);
router.put('/:id', protect, adminOnly, upload.single('file'), update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
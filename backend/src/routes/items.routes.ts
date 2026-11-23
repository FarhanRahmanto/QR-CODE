import { Router } from 'express';
import {
  getItems,
  getSummary,
  getItemById,
  createItem,
  updateItem,
  toggleStatus,
  deleteItem,
  regenerateCode,
  getQrCode,
  getComments,
  markCommentRead,
  markAllCommentsRead,
  deleteComment,
  getScans,
} from '../controllers/items.controller';
import { authMiddleware } from '../middleware/auth';
import { upload, processImage } from '../middleware/upload';
import { asyncHandler } from '../lib/http';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getItems));
router.get('/summary', asyncHandler(getSummary));
router.post('/', upload.single('photo'), processImage, asyncHandler(createItem));

router.patch('/comments/:commentId/read', asyncHandler(markCommentRead));
router.delete('/comments/:commentId', asyncHandler(deleteComment));

router.get('/:id', asyncHandler(getItemById));
router.patch('/:id', upload.single('photo'), processImage, asyncHandler(updateItem));
router.delete('/:id', asyncHandler(deleteItem));
router.patch('/:id/status', asyncHandler(toggleStatus));
router.post('/:id/regenerate-code', asyncHandler(regenerateCode));
router.get('/:id/qr', asyncHandler(getQrCode));

router.get('/:id/comments', asyncHandler(getComments));
router.patch('/:id/comments/read-all', asyncHandler(markAllCommentsRead));
router.get('/:id/scans', asyncHandler(getScans));

export default router;

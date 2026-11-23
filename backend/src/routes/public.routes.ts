import { Router } from 'express';
import {
  getPublicItem,
  submitComment,
  shareLocation,
  redirectToWhatsapp,
} from '../controllers/public.controller';
import { scanLimiter, commentLimiter } from '../middleware/rate-limit';
import { verifyCaptcha } from '../middleware/captcha';
import { asyncHandler } from '../lib/http';

const router = Router();

router.get('/items/:code', scanLimiter, asyncHandler(getPublicItem));
router.post('/items/:code/comments', commentLimiter, verifyCaptcha, asyncHandler(submitComment));
router.post('/items/:code/location', scanLimiter, asyncHandler(shareLocation));
router.get('/items/:code/whatsapp', scanLimiter, asyncHandler(redirectToWhatsapp));

export default router;

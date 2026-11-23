import { Router } from 'express';
import {
  register,
  login,
  logout,
  requestOTP,
  verifyOTP,
  getMe,
  updateMe,
  deleteMe,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rate-limit';
import { asyncHandler } from '../lib/http';

const router = Router();

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/otp/request', otpLimiter, asyncHandler(requestOTP));
router.post('/otp/verify', authLimiter, asyncHandler(verifyOTP));

router.get('/me', authMiddleware, asyncHandler(getMe));
router.patch('/me', authMiddleware, asyncHandler(updateMe));
router.delete('/me', authMiddleware, asyncHandler(deleteMe));

export default router;

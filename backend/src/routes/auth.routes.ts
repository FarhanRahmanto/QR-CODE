import { Router } from 'express';
import { register, login, logout, getMe, updateMe, deleteMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { loginLimiter, registerLimiter } from '../middleware/rate-limit';
import { asyncHandler } from '../lib/http';

const router = Router();

router.post('/register', registerLimiter, asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.post('/logout', asyncHandler(logout));

router.get('/me', authMiddleware, asyncHandler(getMe));
router.patch('/me', authMiddleware, loginLimiter, asyncHandler(updateMe));
router.delete('/me', authMiddleware, loginLimiter, asyncHandler(deleteMe));

export default router;

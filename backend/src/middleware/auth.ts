import type { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE, verifyToken } from '../lib/auth-token';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

/** Wajib login: token dari header `Authorization: Bearer` atau cookie httpOnly */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.cookies?.[AUTH_COOKIE];

  if (!token) {
    res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    return;
  }

  let userId: string;
  try {
    userId = verifyToken(token).userId;
  } catch {
    res.status(401).json({ error: 'Sesi telah kedaluwarsa. Silakan login kembali.' });
    return;
  }

  // Pastikan akun masih ada (token dari akun yang sudah dihapus ditolak)
  prisma.user
    .findUnique({ where: { id: userId }, select: { id: true } })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Akun tidak ditemukan. Silakan login kembali.' });
        return;
      }
      req.user = { userId };
      next();
    })
    .catch(next);
}

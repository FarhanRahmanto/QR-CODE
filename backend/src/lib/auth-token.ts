import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { User } from '@prisma/client';
import { env } from './env';

export interface TokenPayload {
  userId: string;
}

export const AUTH_COOKIE = 'token';

export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies TokenPayload, env.JWT_SECRET, {
    expiresIn: `${env.JWT_EXPIRES_DAYS}d`,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: env.JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, { httpOnly: true, secure: env.isProd, sameSite: 'lax' });
}

/** Data user yang aman dikirim ke frontend (tanpa hash password) */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    createdAt: user.createdAt,
  };
}

/** Kirim token (cookie httpOnly + body untuk header Bearer) beserta data user */
export function sendAuthResponse(res: Response, user: User, message: string, status = 200): void {
  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.status(status).json({ message, token, user: toPublicUser(user) });
}

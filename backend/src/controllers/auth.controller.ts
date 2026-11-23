import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { normalizePhone } from '../lib/phone';
import { sanitizeText } from '../lib/sanitize';
import { clearAuthCookie, sendAuthResponse, toPublicUser } from '../lib/auth-token';
import { HttpError, parseBody } from '../lib/http';
import { deletePhoto } from '../middleware/upload';
import type { AuthRequest } from '../middleware/auth';

const phoneField = z
  .string({ message: 'Nomor WhatsApp wajib diisi.' })
  .transform((v, ctx) => {
    const phone = normalizePhone(v);
    if (!phone) {
      ctx.addIssue({ code: 'custom', message: 'Format nomor WhatsApp tidak valid. Contoh: 08123456789.' });
      return z.NEVER;
    }
    return phone;
  });

const emailField = z
  .string({ message: 'Email wajib diisi.' })
  .trim()
  .toLowerCase()
  .min(1, 'Email wajib diisi.')
  .max(120)
  .refine((v) => z.string().email().safeParse(v).success, { message: 'Format email tidak valid.' });

const passwordField = z
  .string({ message: 'Kata sandi wajib diisi.' })
  .min(8, 'Kata sandi minimal 8 karakter.')
  .max(100, 'Kata sandi maksimal 100 karakter.');

// ---------------------------------------------------------------------------
// Registrasi & Login (email + kata sandi)
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  name: z.string({ message: 'Nama wajib diisi.' }).trim().min(2, 'Nama minimal 2 karakter.').max(80),
  email: emailField,
  password: passwordField,
  phone: phoneField,
});

export async function register(req: Request, res: Response): Promise<void> {
  const data = parseBody(registerSchema, req.body);

  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    throw new HttpError(409, 'Alamat email sudah terdaftar. Silakan masuk.');
  }
  if (await prisma.user.findUnique({ where: { phone: data.phone } })) {
    throw new HttpError(409, 'Nomor WhatsApp sudah dipakai akun lain.');
  }

  const user = await prisma.user.create({
    data: {
      name: sanitizeText(data.name, 80),
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      phone: data.phone,
    },
  });

  sendAuthResponse(res, user, 'Registrasi berhasil', 201);
}

const loginSchema = z.object({
  email: z.string({ message: 'Email wajib diisi.' }).trim().toLowerCase().min(1, 'Email wajib diisi.'),
  password: z.string({ message: 'Kata sandi wajib diisi.' }).min(1, 'Kata sandi wajib diisi.'),
});

// Hash palsu agar waktu respons sama saat email tidak terdaftar (cegah enumerasi akun)
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = parseBody(loginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !valid) {
    throw new HttpError(401, 'Email atau kata sandi tidak sesuai.');
  }

  sendAuthResponse(res, user, 'Login berhasil');
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Berhasil keluar.' });
}

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

async function getCurrentUser(req: AuthRequest) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new HttpError(401, 'Akun tidak ditemukan. Silakan login kembali.');
  return user;
}

async function requirePassword(hash: string, password: unknown, action: string): Promise<void> {
  if (typeof password !== 'string' || !password) {
    throw new HttpError(400, `Masukkan kata sandi saat ini untuk ${action}.`);
  }
  if (!(await bcrypt.compare(password, hash))) {
    throw new HttpError(401, 'Kata sandi saat ini tidak sesuai.');
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getCurrentUser(req);
  res.json({ user: toPublicUser(user) });
}

const updateMeSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80).optional(),
  email: emailField.optional(),
  phone: phoneField.optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordField.optional(),
});

/**
 * PATCH /api/auth/me
 * - Nama: bebas diubah.
 * - Email, nomor WhatsApp, dan kata sandi: wajib konfirmasi kata sandi saat ini.
 */
export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getCurrentUser(req);
  const data = parseBody(updateMeSchema, req.body);
  const update: { name?: string; email?: string; phone?: string; password?: string } = {};

  if (data.name !== undefined) update.name = sanitizeText(data.name, 80);

  const emailChanged = data.email !== undefined && data.email !== user.email;
  const phoneChanged = data.phone !== undefined && data.phone !== user.phone;

  if (emailChanged || phoneChanged || data.newPassword) {
    await requirePassword(user.password, data.currentPassword, 'mengubah data keamanan akun');
  }

  if (emailChanged) {
    if (await prisma.user.findUnique({ where: { email: data.email! } })) {
      throw new HttpError(409, 'Alamat email sudah dipakai akun lain.');
    }
    update.email = data.email;
  }

  if (phoneChanged) {
    if (await prisma.user.findUnique({ where: { phone: data.phone! } })) {
      throw new HttpError(409, 'Nomor WhatsApp sudah dipakai akun lain.');
    }
    update.phone = data.phone;
  }

  if (data.newPassword) update.password = await bcrypt.hash(data.newPassword, 10);

  const updated = await prisma.user.update({ where: { id: user.id }, data: update });
  res.json({ message: 'Profil berhasil diperbarui.', user: toPublicUser(updated) });
}

/** DELETE /api/auth/me — PRD Kepatuhan: hapus akun + seluruh data (wajib konfirmasi kata sandi) */
export async function deleteMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getCurrentUser(req);
  await requirePassword(user.password, req.body?.password, 'menghapus akun');

  const items = await prisma.item.findMany({ where: { ownerId: user.id }, select: { photoUrl: true } });

  // Barang, komentar, dan riwayat scan ikut terhapus (onDelete: Cascade)
  await prisma.user.delete({ where: { id: user.id } });
  await Promise.all(items.map((i) => deletePhoto(i.photoUrl)));

  clearAuthCookie(res);
  res.json({ success: true, message: 'Akun dan seluruh data Anda telah dihapus.' });
}

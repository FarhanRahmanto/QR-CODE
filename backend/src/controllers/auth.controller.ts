import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { normalizePhone } from '../lib/phone';
import { sanitizeText } from '../lib/sanitize';
import { issueOtp, verifyOtp } from '../lib/otp';
import { clearAuthCookie, sendAuthResponse, toPublicUser } from '../lib/auth-token';
import { HttpError, parseBody } from '../lib/http';
import { deleteLocalPhoto } from '../middleware/upload';
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

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || z.string().email().safeParse(v).success, { message: 'Format email tidak valid.' });

const passwordField = z.string().min(6, 'Kata sandi minimal 6 karakter.').max(100);

// ---------------------------------------------------------------------------
// OTP
// ---------------------------------------------------------------------------

const otpRequestSchema = z.object({
  phone: phoneField,
  purpose: z.enum(['login', 'register', 'change-phone']).default('login'),
});

export async function requestOTP(req: Request, res: Response): Promise<void> {
  const { phone, purpose } = parseBody(otpRequestSchema, req.body);
  const existing = await prisma.user.findUnique({ where: { phone } });

  if (purpose === 'login' && !existing) {
    throw new HttpError(404, 'Nomor WhatsApp belum terdaftar. Silakan daftar terlebih dahulu.');
  }
  if (purpose !== 'login' && existing) {
    throw new HttpError(409, 'Nomor WhatsApp sudah terdaftar di akun lain.');
  }

  const { devCode } = await issueOtp(phone);
  res.json({
    success: true,
    message: 'Kode OTP telah dikirim ke WhatsApp Anda.',
    ...(devCode ? { devCode } : {}),
  });
}

const otpVerifySchema = z.object({ phone: phoneField, otp: z.string().trim() });

async function loginWithOtp(res: Response, phoneInput: unknown, otpInput: unknown): Promise<void> {
  const { phone, otp } = parseBody(otpVerifySchema, { phone: phoneInput, otp: otpInput ?? '' });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new HttpError(404, 'Nomor WhatsApp belum terdaftar. Silakan daftar terlebih dahulu.');

  await verifyOtp(phone, otp);
  sendAuthResponse(res, user, 'Login berhasil');
}

/** POST /api/auth/otp/verify — login via OTP WhatsApp (sesuai PRD 6.2) */
export async function verifyOTP(req: Request, res: Response): Promise<void> {
  await loginWithOtp(res, req.body?.phone, req.body?.otp);
}

// ---------------------------------------------------------------------------
// Registrasi & Login
// ---------------------------------------------------------------------------

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80, 'Nama maksimal 80 karakter.'),
    phone: phoneField,
    email: optionalEmail,
    password: passwordField.optional().or(z.literal('').transform(() => undefined)),
    otp: z.string().trim().optional(),
  })
  .refine((d) => !d.password || d.email, {
    message: 'Email wajib diisi jika ingin login dengan kata sandi.',
  });

export async function register(req: Request, res: Response): Promise<void> {
  const data = parseBody(registerSchema, req.body);

  if (await prisma.user.findUnique({ where: { phone: data.phone } })) {
    throw new HttpError(409, 'Nomor WhatsApp sudah terdaftar. Silakan masuk.');
  }
  if (data.email && (await prisma.user.findUnique({ where: { email: data.email } }))) {
    throw new HttpError(409, 'Alamat email sudah terdaftar.');
  }

  // Jika OTP disertakan, verifikasi kepemilikan nomor saat registrasi
  if (data.otp) await verifyOtp(data.phone, data.otp);

  const user = await prisma.user.create({
    data: {
      name: sanitizeText(data.name, 80),
      phone: data.phone,
      email: data.email ?? null,
      password: data.password ? await bcrypt.hash(data.password, 10) : null,
    },
  });

  sendAuthResponse(res, user, 'Registrasi berhasil', 201);
}

const emailLoginSchema = z.object({
  email: z.string({ message: 'Email wajib diisi.' }).trim().toLowerCase().min(1, 'Email wajib diisi.'),
  password: z.string({ message: 'Kata sandi wajib diisi.' }).min(1, 'Kata sandi wajib diisi.'),
});

export async function login(req: Request, res: Response): Promise<void> {
  if (req.body?.mode !== 'email') {
    await loginWithOtp(res, req.body?.phone, req.body?.otp);
    return;
  }

  const { email, password } = parseBody(emailLoginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  // Pesan sama untuk email tidak ada / password salah (cegah enumerasi akun)
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
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

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getCurrentUser(req);
  res.json({ user: toPublicUser(user) });
}

const updateMeSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80).optional(),
  phone: phoneField.optional(),
  otp: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, { message: 'Format email tidak valid.' }),
  currentPassword: z.string().optional(),
  newPassword: passwordField.optional(),
});

/** PATCH /api/auth/me — ubah nama, nomor WhatsApp (wajib OTP), email, dan kata sandi */
export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getCurrentUser(req);
  const data = parseBody(updateMeSchema, req.body);
  const update: { name?: string; phone?: string; email?: string | null; password?: string } = {};

  if (data.name !== undefined) update.name = sanitizeText(data.name, 80);

  if (data.phone && data.phone !== user.phone) {
    if (await prisma.user.findUnique({ where: { phone: data.phone } })) {
      throw new HttpError(409, 'Nomor WhatsApp sudah dipakai akun lain.');
    }
    if (!data.otp) {
      throw new HttpError(400, 'Verifikasi OTP diperlukan untuk mengganti nomor WhatsApp.');
    }
    await verifyOtp(data.phone, data.otp);
    update.phone = data.phone;
  }

  if (data.email !== undefined) {
    const email = data.email || null;
    if (email && email !== user.email && (await prisma.user.findUnique({ where: { email } }))) {
      throw new HttpError(409, 'Alamat email sudah dipakai akun lain.');
    }
    update.email = email;
  }

  if (data.newPassword) {
    if (user.password) {
      if (!data.currentPassword || !(await bcrypt.compare(data.currentPassword, user.password))) {
        throw new HttpError(401, 'Kata sandi saat ini tidak sesuai.');
      }
    }
    if (!(update.email ?? user.email)) {
      throw new HttpError(400, 'Tambahkan email terlebih dahulu agar bisa login dengan kata sandi.');
    }
    update.password = await bcrypt.hash(data.newPassword, 10);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: update });
  res.json({ message: 'Profil berhasil diperbarui.', user: toPublicUser(updated) });
}

/** DELETE /api/auth/me — PRD Kepatuhan: hapus akun beserta seluruh datanya */
export async function deleteMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getCurrentUser(req);
  const items = await prisma.item.findMany({ where: { ownerId: user.id }, select: { photoUrl: true } });

  // Barang, komentar, dan riwayat scan ikut terhapus (onDelete: Cascade)
  await prisma.$transaction([
    prisma.otpCode.deleteMany({ where: { phone: user.phone } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  items.forEach((i) => deleteLocalPhoto(i.photoUrl));

  clearAuthCookie(res);
  res.json({ success: true, message: 'Akun dan seluruh data Anda telah dihapus.' });
}

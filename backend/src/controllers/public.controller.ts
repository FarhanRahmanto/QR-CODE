import type { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { sanitizeOptional, sanitizeText } from '../lib/sanitize';
import { HttpError, param, parseBody } from '../lib/http';
import { sendCommentNotification, sendScanNotification } from '../services/notification.service';

const SCAN_DEDUPE_MS = 60 * 1000; // scan berulang dari pengunjung sama dalam 1 menit dihitung sekali
const LOCATION_WINDOW_MS = 30 * 60 * 1000;

function getCode(req: Request): string {
  const code = param(req, 'code');
  if (!/^[A-Za-z0-9]{6,32}$/.test(code)) throw new HttpError(404, 'Kode stiker tidak valid.');
  return code;
}

/** Hash IP + salt: dipakai untuk deduplikasi tanpa menyimpan IP asli (privasi) */
function hashIp(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(`${env.IP_HASH_SALT}:${ip}`).digest('hex').slice(0, 32);
}

/** GET /api/public/items/:code — data publik + catat scan + trigger notifikasi (PRD P1, P2, FR-03) */
export async function getPublicItem(req: Request, res: Response): Promise<void> {
  const item = await prisma.item.findUnique({
    where: { publicCode: getCode(req) },
    select: {
      id: true,
      publicCode: true,
      itemName: true,
      ownerName: true,
      photoUrl: true,
      description: true,
      ownerMessage: true,
      status: true,
      allowWhatsapp: true,
      allowComments: true,
    },
  });
  if (!item) throw new HttpError(404, 'Barang tidak ditemukan atau kode stiker tidak valid.');

  const ipHash = hashIp(req);
  const recent = await prisma.scan.findFirst({
    where: { itemId: item.id, ipHash, createdAt: { gte: new Date(Date.now() - SCAN_DEDUPE_MS) } },
    select: { id: true },
  });

  if (!recent) {
    await prisma.scan.create({
      data: {
        itemId: item.id,
        ipHash,
        userAgent: req.headers['user-agent']?.slice(0, 300) || null,
      },
    });
    sendScanNotification(item.id).catch((err) => console.error('[Scan Notif Error]', err));
  }

  // Nomor WhatsApp pemilik TIDAK pernah dikirim ke publik
  const { id: _id, ...publicData } = item;
  res.setHeader('Cache-Control', 'no-store');
  res.json(publicData);
}

const locationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

/** POST /api/public/items/:code/location — penemu membagikan perkiraan lokasi (PRD O7, opsional) */
export async function shareLocation(req: Request, res: Response): Promise<void> {
  const { latitude, longitude } = parseBody(locationSchema, req.body);
  const item = await prisma.item.findUnique({ where: { publicCode: getCode(req) }, select: { id: true } });
  if (!item) throw new HttpError(404, 'Barang tidak ditemukan.');

  const scan = await prisma.scan.findFirst({
    where: {
      itemId: item.id,
      ipHash: hashIp(req),
      createdAt: { gte: new Date(Date.now() - LOCATION_WINDOW_MS) },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!scan) throw new HttpError(404, 'Sesi scan tidak ditemukan. Muat ulang halaman lalu coba lagi.');

  await prisma.scan.update({
    where: { id: scan.id },
    data: { latitude: Math.round(latitude * 1e4) / 1e4, longitude: Math.round(longitude * 1e4) / 1e4 },
  });
  res.json({ success: true, message: 'Lokasi berhasil dibagikan ke pemilik. Terima kasih!' });
}

const commentSchema = z.object({
  finderName: z.string().max(80, 'Nama maksimal 80 karakter.').nullable(),
  message: z.string().min(5, 'Pesan laporan minimal 5 karakter.').max(1000, 'Pesan maksimal 1000 karakter.'),
  location: z.string().max(200, 'Lokasi maksimal 200 karakter.').nullable(),
});

/** POST /api/public/items/:code/comments — laporan penemu (PRD P3, FR-04) */
export async function submitComment(req: Request, res: Response): Promise<void> {
  const data = parseBody(commentSchema, {
    finderName: sanitizeOptional(req.body?.finderName, 80),
    message: sanitizeText(req.body?.message, 1000),
    location: sanitizeOptional(req.body?.location, 200),
  });

  const item = await prisma.item.findUnique({ where: { publicCode: getCode(req) } });
  if (!item) throw new HttpError(404, 'Barang tidak ditemukan.');
  if (!item.allowComments) {
    throw new HttpError(403, 'Pemilik sedang menonaktifkan formulir laporan untuk barang ini.');
  }

  const comment = await prisma.comment.create({
    data: { itemId: item.id, finderName: data.finderName, message: data.message, location: data.location },
  });

  sendCommentNotification(item.id, comment).catch((err) => console.error('[Comment Notif Error]', err));

  res.status(201).json({
    success: true,
    message: 'Laporan berhasil dikirim ke pemilik barang. Terima kasih!',
    comment,
  });
}

/** GET /api/public/items/:code/whatsapp — redirect ke wa.me tanpa membuka nomor di HTML (PRD P4, FR-05) */
export async function redirectToWhatsapp(req: Request, res: Response): Promise<void> {
  const code = getCode(req);
  const item = await prisma.item.findUnique({ where: { publicCode: code }, include: { owner: true } });

  if (!item || !item.allowWhatsapp) {
    // Navigasi browser: kembalikan ke halaman scan, bukan JSON mentah
    if (req.accepts(['html', 'json']) === 'html') {
      const target = process.env.VERCEL ? `/s/${code}?wa=disabled` : `${env.FRONTEND_URL}/s/${code}?wa=disabled`;
      res.redirect(target);
      return;
    }
    throw new HttpError(403, 'Pemilik tidak mengaktifkan fitur kontak via WhatsApp.');
  }

  const text = encodeURIComponent(
    `Halo ${item.ownerName}, saya menemukan barang Anda (${item.itemName}) melalui stiker TemuBarang.`
  );
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(`https://wa.me/${item.owner.phone}?text=${text}`);
}

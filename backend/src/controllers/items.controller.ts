import type { Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { sanitizeOptional, sanitizeText, toBool } from '../lib/sanitize';
import { HttpError, param, parseBody } from '../lib/http';
import { deletePhoto } from '../middleware/upload';
import type { AuthRequest } from '../middleware/auth';

// Tanpa karakter ambigu (0/O, 1/l/I) agar mudah dibaca jika dicetak
const CODE_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** PRD FR-01: public_code acak (crypto), tidak berurutan, 10 karakter, dijamin unik */
async function generatePublicCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = '';
    for (let i = 0; i < 10; i++) code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    const exists = await prisma.item.findUnique({ where: { publicCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new HttpError(500, 'Gagal membuat kode unik. Silakan coba lagi.');
}

export function publicUrl(code: string, req?: AuthRequest): string {
  const configured = env.APP_URL.replace(/\/$/, '');
  if (configured && !configured.includes('localhost')) {
    return `${configured}/s/${code}`;
  }
  const host = req?.get('host');
  if (env.isProd && host) {
    return `${req?.protocol || 'https'}://${host}/s/${code}`;
  }
  return `${configured}/s/${code}`;
}

async function findOwnedItem(req: AuthRequest) {
  const item = await prisma.item.findFirst({
    where: { id: param(req, 'id'), ownerId: req.user!.userId },
  });
  if (!item) throw new HttpError(404, 'Barang tidak ditemukan.');
  return item;
}

// Form-data selalu string, jadi validasi dilakukan setelah sanitasi
const itemSchema = z.object({
  itemName: z.string().min(2, 'Nama barang minimal 2 karakter.').max(100, 'Nama barang maksimal 100 karakter.'),
  ownerName: z.string().min(2, 'Nama pemilik minimal 2 karakter.').max(80, 'Nama pemilik maksimal 80 karakter.'),
  description: z.string().min(5, 'Ciri-ciri barang minimal 5 karakter.').max(1000, 'Ciri-ciri maksimal 1000 karakter.'),
  ownerMessage: z.string().max(500, 'Pesan pemilik maksimal 500 karakter.').nullable(),
  allowWhatsapp: z.boolean(),
  allowComments: z.boolean(),
});

function readItemBody(body: Record<string, unknown>) {
  return {
    itemName: body.itemName !== undefined ? sanitizeText(body.itemName, 100) : undefined,
    ownerName: body.ownerName !== undefined ? sanitizeText(body.ownerName, 80) : undefined,
    description: body.description !== undefined ? sanitizeText(body.description, 1000) : undefined,
    ownerMessage: body.ownerMessage !== undefined ? sanitizeOptional(body.ownerMessage, 500) : undefined,
    allowWhatsapp: toBool(body.allowWhatsapp),
    allowComments: toBool(body.allowComments),
  };
}

// ---------------------------------------------------------------------------

export async function getItems(req: AuthRequest, res: Response): Promise<void> {
  const items = await prisma.item.findMany({
    where: { ownerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { comments: { where: { isRead: false } }, scans: true } },
    },
  });

  res.json(
    items.map(({ _count, ...item }) => ({
      ...item,
      unreadComments: _count.comments,
      totalScans: _count.scans,
    }))
  );
}

/** GET /api/items/summary — ringkasan untuk dashboard */
export async function getSummary(req: AuthRequest, res: Response): Promise<void> {
  const ownerId = req.user!.userId;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalItems, lostItems, unreadComments, scansLast7Days] = await Promise.all([
    prisma.item.count({ where: { ownerId } }),
    prisma.item.count({ where: { ownerId, status: 'LOST' } }),
    prisma.comment.count({ where: { isRead: false, item: { ownerId } } }),
    prisma.scan.count({ where: { createdAt: { gte: weekAgo }, item: { ownerId } } }),
  ]);

  res.json({ totalItems, lostItems, safeItems: totalItems - lostItems, unreadComments, scansLast7Days });
}

export async function getItemById(req: AuthRequest, res: Response): Promise<void> {
  const item = await prisma.item.findFirst({
    where: { id: param(req, 'id'), ownerId: req.user!.userId },
    include: {
      comments: { orderBy: { createdAt: 'desc' } },
      scans: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!item) throw new HttpError(404, 'Barang tidak ditemukan.');

  res.json({
    ...item,
    publicUrl: publicUrl(item.publicCode, req),
    unreadComments: item.comments.filter((c) => !c.isRead).length,
  });
}

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
  const input = readItemBody(req.body);
  const data = parseBody(itemSchema, {
    itemName: input.itemName ?? '',
    ownerName: input.ownerName ?? '',
    description: input.description ?? '',
    ownerMessage: input.ownerMessage ?? null,
    allowWhatsapp: input.allowWhatsapp ?? false,
    allowComments: input.allowComments ?? true,
  });

  try {
    const item = await prisma.item.create({
      data: {
        ...data,
        publicCode: await generatePublicCode(),
        ownerId: req.user!.userId,
        photoUrl: (res.locals.photoUrl as string | undefined) ?? null,
        status: 'SAFE',
      },
    });
    res.status(201).json({ ...item, publicUrl: publicUrl(item.publicCode, req), unreadComments: 0 });
  } catch (err) {
    await deletePhoto(res.locals.photoUrl);
    throw err;
  }
}

export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  let existing;
  try {
    existing = await findOwnedItem(req);
  } catch (err) {
    await deletePhoto(res.locals.photoUrl);
    throw err;
  }

  const input = readItemBody(req.body);
  const data = parseBody(itemSchema, {
    itemName: input.itemName ?? existing.itemName,
    ownerName: input.ownerName ?? existing.ownerName,
    description: input.description ?? existing.description,
    ownerMessage: input.ownerMessage !== undefined ? input.ownerMessage : existing.ownerMessage,
    allowWhatsapp: input.allowWhatsapp ?? existing.allowWhatsapp,
    allowComments: input.allowComments ?? existing.allowComments,
  });

  let photoUrl = existing.photoUrl;
  if (res.locals.photoUrl) photoUrl = res.locals.photoUrl as string;
  else if (toBool(req.body.removePhoto)) photoUrl = null;

  const updated = await prisma.item.update({
    where: { id: existing.id },
    data: { ...data, photoUrl },
  });

  if (photoUrl !== existing.photoUrl) await deletePhoto(existing.photoUrl);
  res.json({ ...updated, publicUrl: publicUrl(updated.publicCode, req) });
}

/** PATCH /api/items/:id/status — body { status: "SAFE" | "LOST" } opsional; tanpa body = toggle */
export async function toggleStatus(req: AuthRequest, res: Response): Promise<void> {
  const existing = await findOwnedItem(req);
  const requested = req.body?.status;

  let status: 'SAFE' | 'LOST';
  if (requested === 'SAFE' || requested === 'LOST') status = requested;
  else if (requested === undefined) status = existing.status === 'SAFE' ? 'LOST' : 'SAFE';
  else throw new HttpError(400, 'Status harus SAFE atau LOST.');

  const updated = await prisma.item.update({ where: { id: existing.id }, data: { status } });
  res.json(updated);
}

export async function deleteItem(req: AuthRequest, res: Response): Promise<void> {
  const existing = await findOwnedItem(req);
  await prisma.item.delete({ where: { id: existing.id } });
  await deletePhoto(existing.photoUrl);
  res.json({ success: true, message: 'Barang berhasil dihapus.' });
}

/** POST /api/items/:id/regenerate-code — buat kode baru (stiker lama tidak berlaku lagi) */
export async function regenerateCode(req: AuthRequest, res: Response): Promise<void> {
  const existing = await findOwnedItem(req);
  const updated = await prisma.item.update({
    where: { id: existing.id },
    data: { publicCode: await generatePublicCode() },
  });
  res.json({ ...updated, publicUrl: publicUrl(updated.publicCode, req) });
}

/** GET /api/items/:id/qr?format=png|svg&size=1024&download=1 — PRD FR-08 stiker siap cetak */
export async function getQrCode(req: AuthRequest, res: Response): Promise<void> {
  const item = await findOwnedItem(req);
  const url = publicUrl(item.publicCode, req);
  const format = req.query.format === 'svg' ? 'svg' : 'png';
  const size = Math.min(Math.max(Number(req.query.size) || 1024, 128), 2048);
  const safeName = item.itemName.replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 40) || 'barang';

  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="stiker-qr-${safeName}.${format}"`);
  }

  if (format === 'svg') {
    const svg = await QRCode.toString(url, { type: 'svg', margin: 2, errorCorrectionLevel: 'H', width: size });
    res.type('image/svg+xml').send(svg);
    return;
  }

  const png = await QRCode.toBuffer(url, { type: 'png', margin: 2, errorCorrectionLevel: 'H', width: size });
  res.type('image/png').send(png);
}

// ---------------------------------------------------------------------------
// Inbox laporan & riwayat scan
// ---------------------------------------------------------------------------

export async function getComments(req: AuthRequest, res: Response): Promise<void> {
  const item = await findOwnedItem(req);
  const comments = await prisma.comment.findMany({
    where: { itemId: item.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(comments);
}

export async function markCommentRead(req: AuthRequest, res: Response): Promise<void> {
  const commentId = param(req, 'commentId');
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, item: { ownerId: req.user!.userId } },
  });
  if (!comment) throw new HttpError(404, 'Laporan tidak ditemukan.');

  const updated = await prisma.comment.update({ where: { id: comment.id }, data: { isRead: true } });
  res.json(updated);
}

export async function markAllCommentsRead(req: AuthRequest, res: Response): Promise<void> {
  const item = await findOwnedItem(req);
  const result = await prisma.comment.updateMany({
    where: { itemId: item.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true, updated: result.count });
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  const commentId = param(req, 'commentId');
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, item: { ownerId: req.user!.userId } },
  });
  if (!comment) throw new HttpError(404, 'Laporan tidak ditemukan.');

  await prisma.comment.delete({ where: { id: comment.id } });
  res.json({ success: true });
}

export async function getScans(req: AuthRequest, res: Response): Promise<void> {
  const item = await findOwnedItem(req);
  const scans = await prisma.scan.findMany({
    where: { itemId: item.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, itemId: true, userAgent: true, latitude: true, longitude: true, createdAt: true },
  });
  res.json(scans);
}

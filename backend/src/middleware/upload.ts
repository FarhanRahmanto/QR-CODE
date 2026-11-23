import multer from 'multer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/http';

/** Folder lama untuk foto berbasis file (di Vercel pakai /tmp karena filesystem read-only) */
export const UPLOADS_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'temubarang-uploads')
  : path.resolve(__dirname, '../../uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch {
  // abaikan pada filesystem read-only; foto baru disimpan di database
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_URL_RE = /^\/api\/photos\/([a-z0-9]+)$/i;

/** PRD FR-07: JPG/PNG/WebP, maksimal 5 MB. File ditahan di memori untuk dikompres. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'Hanya file gambar JPG, PNG, atau WebP yang diperbolehkan.'));
  },
});

/**
 * PRD FR-07: kompres otomatis lalu simpan di database (tabel Photo).
 * Gambar diputar sesuai EXIF, diperkecil maks 1024px, dikonversi ke WebP kualitas 75,
 * dan metadata (termasuk lokasi GPS) dibuang. URL hasil: res.locals.photoUrl
 */
export async function processImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.file) return next();

  let data: Buffer;
  try {
    data = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
  } catch {
    return next(new HttpError(400, 'File gambar rusak atau tidak dapat diproses.'));
  }

  try {
    const photo = await prisma.photo.create({ data: { data: new Uint8Array(data), mimeType: 'image/webp' } });
    res.locals.photoUrl = `/api/photos/${photo.id}`;
    req.file.buffer = Buffer.alloc(0);
    next();
  } catch (err) {
    next(err);
  }
}

/** Hapus foto saat diganti atau barang/akun dihapus */
export async function deletePhoto(photoUrl: string | null | undefined): Promise<void> {
  if (!photoUrl) return;

  const match = PHOTO_URL_RE.exec(photoUrl);
  if (match) {
    await prisma.photo.deleteMany({ where: { id: match[1] } }).catch(() => undefined);
    return;
  }

  if (photoUrl.startsWith('/uploads/')) {
    await fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(photoUrl))).catch(() => undefined);
  }
}

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/http';

export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/** PRD FR-07: JPG/PNG/WebP, maksimal 5 MB. File disimpan sementara di memori untuk dikompres. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'Hanya file gambar JPG, PNG, atau WebP yang diperbolehkan.'));
  },
});

/**
 * PRD FR-07: kompres otomatis. Gambar diputar sesuai EXIF, diperkecil maks 1280px,
 * dikonversi ke WebP (kualitas 80) dan metadata (termasuk lokasi GPS) dibuang.
 */
export async function processImage(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.file) return next();

  try {
    const filename = `item_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.webp`;
    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOADS_DIR, filename));

    req.file.filename = filename;
    req.file.buffer = Buffer.alloc(0);
    next();
  } catch {
    next(new HttpError(400, 'File gambar rusak atau tidak dapat diproses.'));
  }
}

/** Hapus foto lokal (/uploads/...) saat diganti atau barang/akun dihapus */
export function deleteLocalPhoto(photoUrl: string | null | undefined): void {
  if (!photoUrl || !photoUrl.startsWith('/uploads/')) return;
  const filePath = path.join(UPLOADS_DIR, path.basename(photoUrl));
  fs.promises.unlink(filePath).catch(() => undefined);
}

import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { HttpError } from '../lib/http';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran foto maksimal 5 MB.' : 'Upload foto gagal. Periksa file Anda.';
    res.status(400).json({ error: message });
    return;
  }

  // JSON body tidak valid
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Format data tidak valid.' });
    return;
  }

  // Prisma: data tidak ditemukan / duplikat unik
  const code = (err as { code?: string })?.code;
  if (code === 'P2025') {
    res.status(404).json({ error: 'Data tidak ditemukan.' });
    return;
  }
  if (code === 'P2002') {
    res.status(409).json({ error: 'Data sudah terdaftar.' });
    return;
  }

  console.error(`[Error] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server. Silakan coba lagi.' });
}

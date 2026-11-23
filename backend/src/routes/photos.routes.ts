import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, HttpError, param } from '../lib/http';

const router = Router();

/** GET /api/photos/:id — foto barang (publik, dipakai juga di halaman scan) */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    if (!/^[a-z0-9]{10,40}$/i.test(id)) throw new HttpError(404, 'Foto tidak ditemukan.');

    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new HttpError(404, 'Foto tidak ditemukan.');

    // Ganti foto = id baru, jadi aman di-cache selamanya
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(photo.mimeType).send(Buffer.from(photo.data));
  })
);

export default router;

import { env } from './lib/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { prisma } from './lib/prisma';
import { UPLOADS_DIR } from './middleware/upload';
import { errorHandler, notFoundHandler } from './middleware/error';
import authRoutes from './routes/auth.routes';
import itemsRoutes from './routes/items.routes';
import publicRoutes from './routes/public.routes';
import photosRoutes from './routes/photos.routes';

const app = express();

// Di belakang reverse proxy (Vercel/Render/Nginx) agar req.ip & rate limit akurat
app.set('trust proxy', env.TRUST_PROXY);
app.disable('x-powered-by');

app.use(
  helmet({
    // Izinkan gambar dimuat dari domain frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = new Set([
  env.FRONTEND_URL,
  env.APP_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      if (process.env.VERCEL && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// File foto barang lama (non-DB)
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d', immutable: true }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'TemuBarang API', database: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', service: 'TemuBarang API', database: 'unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/photos', photosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 TemuBarang API berjalan di http://localhost:${env.PORT}`);
    console.log(`🔗 Frontend   : ${env.FRONTEND_URL}`);
    console.log(`🏷️  URL QR     : ${env.APP_URL}/s/{kode}`);
    console.log(
      env.WHATSAPP_DEV_MODE
        ? '📱 WhatsApp   : MODE DEV (notifikasi dicetak ke log server)\n'
        : '📱 WhatsApp   : terhubung ke gateway\n'
    );
  });

  async function shutdown(signal: string) {
    console.log(`\n${signal} diterima, menutup server...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

export default app;

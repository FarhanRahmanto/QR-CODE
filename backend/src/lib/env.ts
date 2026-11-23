import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_secret_temubarang_change_me';
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET wajib diisi (minimal 32 karakter) di environment production.');
}

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const defaultFrontendUrl = vercelHost ? `https://${vercelHost}` : 'http://localhost:5173';

/** Abaikan URL internal Vercel service binding (.services.vercel-infra.com) untuk link publik/QR */
function publicUrlOrDefault(val: string | undefined, fallback: string): string {
  const clean = val?.trim().replace(/\/$/, '');
  if (!clean || clean.includes('.services.vercel-infra.com')) return fallback;
  return clean;
}

function parseTrustProxy(value: string | undefined): number | boolean {
  if (value === undefined || value === '') {
    if (process.env.VERCEL) return 1;
    return isProd ? 2 : false;
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  const n = Number(value);
  return Number.isFinite(n) ? n : false;
}

export const env = {
  NODE_ENV,
  isProd,
  PORT: Number(process.env.PORT) || 3000,
  /** URL internal dari Vercel service binding (dipakai CORS) */
  INTERNAL_FRONTEND_URL: (process.env.FRONTEND_URL || '').replace(/\/$/, ''),
  /** URL publik frontend, dipakai untuk link di notifikasi & redirect */
  FRONTEND_URL: publicUrlOrDefault(process.env.FRONTEND_URL, defaultFrontendUrl),
  /** URL publik yang tercetak di QR stiker: {APP_URL}/s/{kode} */
  APP_URL: publicUrlOrDefault(process.env.APP_URL || process.env.FRONTEND_URL, defaultFrontendUrl),
  JWT_SECRET,
  JWT_EXPIRES_DAYS: 30,
  /**
   * Jumlah proxy di depan server agar IP asli pengunjung terbaca untuk rate limit & hash IP scan.
   */
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY),
  WHATSAPP_API_TOKEN,
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send',
  /** Tanpa token WhatsApp, notifikasi hanya dicetak ke console/log server */
  WHATSAPP_DEV_MODE: !WHATSAPP_API_TOKEN,
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET || '',
  IP_HASH_SALT: process.env.IP_HASH_SALT || JWT_SECRET,
};

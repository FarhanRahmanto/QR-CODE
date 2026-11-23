import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_secret_temubarang_change_me';
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET wajib diisi (minimal 32 karakter) di environment production.');
}

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';

export const env = {
  NODE_ENV,
  isProd,
  PORT: Number(process.env.PORT) || 3000,
  /** URL frontend, dipakai untuk CORS dan link di notifikasi */
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  /** URL publik yang tercetak di QR stiker: {APP_URL}/s/{code} */
  APP_URL: process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET,
  JWT_EXPIRES_DAYS: 30,
  WHATSAPP_API_TOKEN,
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send',
  /** Tanpa token WhatsApp, OTP selalu 123456 dan pesan hanya dicetak ke console */
  WHATSAPP_DEV_MODE: !WHATSAPP_API_TOKEN,
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET || '',
  IP_HASH_SALT: process.env.IP_HASH_SALT || JWT_SECRET,
};

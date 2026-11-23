import crypto from 'crypto';
import { prisma } from './prisma';
import { env } from './env';
import { sendWhatsApp } from './whatsapp';

const OTP_TTL_MS = 5 * 60 * 1000; // berlaku 5 menit
const OTP_COOLDOWN_MS = 60 * 1000; // jeda kirim ulang 60 detik
const OTP_MAX_ATTEMPTS = 5;
export const DEV_OTP = '123456';

function hashCode(phone: string, code: string): string {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(`${phone}:${code}`).digest('hex');
}

export class OtpError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Buat & kirim OTP via WhatsApp. Mode dev: kode selalu 123456. */
export async function issueOtp(phone: string): Promise<{ devCode?: string }> {
  const latest = await prisma.otpCode.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  });

  if (!env.WHATSAPP_DEV_MODE && latest && Date.now() - latest.createdAt.getTime() < OTP_COOLDOWN_MS) {
    const wait = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000);
    throw new OtpError(`Tunggu ${wait} detik sebelum meminta kode OTP baru.`, 429);
  }

  const code = env.WHATSAPP_DEV_MODE
    ? DEV_OTP
    : crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

  await prisma.otpCode.deleteMany({ where: { phone } });
  await prisma.otpCode.create({
    data: {
      phone,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const sent = await sendWhatsApp(
    phone,
    `*${code}* adalah kode verifikasi TemuBarang Anda.\n\nKode berlaku 5 menit. Jangan berikan kode ini kepada siapa pun.`
  );
  if (!sent) throw new OtpError('Gagal mengirim kode OTP ke WhatsApp. Coba lagi nanti.', 502);

  return env.WHATSAPP_DEV_MODE ? { devCode: code } : {};
}

/** Verifikasi OTP. Kode sekali pakai, maksimal 5 percobaan. */
export async function verifyOtp(phone: string, code: unknown): Promise<void> {
  if (typeof code !== 'string' || !/^[0-9]{6}$/.test(code)) {
    throw new OtpError('Kode OTP harus 6 digit angka.');
  }

  const record = await prisma.otpCode.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new OtpError('Kode OTP kedaluwarsa atau belum diminta. Silakan minta kode baru.', 401);
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpCode.delete({ where: { id: record.id } });
    throw new OtpError('Terlalu banyak percobaan. Silakan minta kode OTP baru.', 429);
  }

  const expected = Buffer.from(record.codeHash, 'hex');
  const actual = Buffer.from(hashCode(phone, code), 'hex');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw new OtpError('Kode OTP salah.', 401);
  }

  await prisma.otpCode.deleteMany({ where: { phone } });
}

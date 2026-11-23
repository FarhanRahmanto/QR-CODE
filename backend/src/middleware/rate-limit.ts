import rateLimit from 'express-rate-limit';

function limiter(windowMinutes: number, limit: number, message: string) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });
}

/** PRD NFR: rate limiting endpoint scan publik */
export const scanLimiter = limiter(15, 120, 'Terlalu banyak permintaan. Coba lagi beberapa menit lagi.');

/** PRD NFR: rate limiting form komentar penemu */
export const commentLimiter = limiter(10, 5, 'Terlalu banyak laporan terkirim. Coba lagi dalam 10 menit.');

/** Batasi permintaan OTP per IP agar tidak disalahgunakan untuk spam WhatsApp */
export const otpLimiter = limiter(15, 5, 'Terlalu banyak permintaan kode OTP. Coba lagi dalam 15 menit.');

/** Batasi percobaan login/registrasi (anti brute-force) */
export const authLimiter = limiter(15, 30, 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.');

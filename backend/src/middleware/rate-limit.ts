import rateLimit from 'express-rate-limit';

function limiter(windowMinutes: number, limit: number, message: string, skipSuccessfulRequests = false) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { error: message },
  });
}

/** PRD NFR: rate limiting endpoint scan publik */
export const scanLimiter = limiter(15, 120, 'Terlalu banyak permintaan. Coba lagi beberapa menit lagi.');

/** PRD NFR: rate limiting form komentar penemu */
export const commentLimiter = limiter(10, 5, 'Terlalu banyak laporan terkirim. Coba lagi dalam 10 menit.');

/** Anti brute-force: hanya percobaan GAGAL yang dihitung (10 kali / 15 menit per IP) */
export const loginLimiter = limiter(
  15,
  10,
  'Terlalu banyak percobaan dengan kata sandi salah. Coba lagi dalam 15 menit.',
  true
);

/** Batasi pembuatan akun massal */
export const registerLimiter = limiter(60, 10, 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.');

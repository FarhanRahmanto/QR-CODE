import type { Request, Response, NextFunction } from 'express';
import { env } from '../lib/env';

/**
 * PRD NFR: CAPTCHA (Cloudflare Turnstile) pada form komentar.
 * Aktif hanya jika TURNSTILE_SECRET diisi; token dikirim di body sebagai `captchaToken`.
 */
export async function verifyCaptcha(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!env.TURNSTILE_SECRET) return next();

  const token = req.body?.captchaToken;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Verifikasi CAPTCHA diperlukan.' });
    return;
  }

  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
    if (req.ip) body.set('remoteip', req.ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await result.json()) as { success?: boolean };

    if (!data.success) {
      res.status(400).json({ error: 'Verifikasi CAPTCHA gagal. Silakan coba lagi.' });
      return;
    }
    next();
  } catch {
    res.status(502).json({ error: 'Layanan verifikasi CAPTCHA tidak dapat dihubungi.' });
  }
}

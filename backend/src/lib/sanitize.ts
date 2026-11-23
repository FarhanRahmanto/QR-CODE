/**
 * Sanitasi teks bebas dari pengguna (anti-XSS):
 * buang tag HTML, karakter kontrol, dan rapikan spasi di ujung.
 */
export function sanitizeText(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeOptional(value: unknown, maxLength = 1000): string | null {
  const clean = sanitizeText(value, maxLength);
  return clean.length > 0 ? clean : null;
}

/** Konversi nilai form-data ("true"/"false") atau boolean menjadi boolean */
export function toBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

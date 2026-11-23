/**
 * Normalisasi nomor WhatsApp Indonesia ke format internasional tanpa "+".
 * Contoh: "0812-3456-789" -> "628123456789", "+62 812..." -> "62812...".
 * Mengembalikan null bila format tidak valid.
 */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let digits = input.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  else if (digits.startsWith('8')) digits = '62' + digits;
  if (!/^[1-9][0-9]{9,14}$/.test(digits)) return null;
  return digits;
}

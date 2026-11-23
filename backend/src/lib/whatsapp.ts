import { env } from './env';

/**
 * Kirim pesan WhatsApp melalui gateway (default: Fonnte).
 * Jika WHATSAPP_API_TOKEN kosong, pesan hanya dicetak ke console (mode development).
 */
export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (env.WHATSAPP_DEV_MODE) {
    console.log('\n================== [WHATSAPP - MODE DEV] ==================');
    console.log(`Penerima : ${phone}`);
    console.log(`Pesan    :\n${message}`);
    console.log('===========================================================\n');
    return true;
  }

  try {
    const res = await fetch(env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: env.WHATSAPP_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: phone, message, countryCode: '62' }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error(`[WhatsApp] Gagal mengirim ke ${phone}: HTTP ${res.status}`);
      return false;
    }
    console.log(`[WhatsApp] Pesan terkirim ke ${phone}`);
    return true;
  } catch (err) {
    console.error('[WhatsApp] Error:', err);
    return false;
  }
}

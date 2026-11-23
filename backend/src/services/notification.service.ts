import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { sendWhatsApp } from '../lib/whatsapp';

const THROTTLE_MS = 10 * 60 * 1000; // PRD FR-03: maksimal 1 notifikasi / 10 menit / barang

function formatWaktu(date: Date): string {
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  }) + ' WIB';
}

/**
 * Notifikasi WhatsApp ke pemilik saat stiker discan.
 * Throttle dilakukan secara atomik (updateMany bersyarat) sehingga aman dari race condition.
 */
export async function sendScanNotification(itemId: string): Promise<boolean> {
  const now = new Date();
  const threshold = new Date(now.getTime() - THROTTLE_MS);

  const claimed = await prisma.item.updateMany({
    where: {
      id: itemId,
      OR: [{ lastNotifiedAt: null }, { lastNotifiedAt: { lt: threshold } }],
    },
    data: { lastNotifiedAt: now },
  });

  if (claimed.count === 0) {
    console.log(`[Notifikasi] Dilewati (throttle 10 menit) untuk item ${itemId}`);
    return false;
  }

  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { owner: true } });
  if (!item) return false;

  const statusText = item.status === 'LOST' ? '🔴 HILANG' : '🟢 AMAN';
  const message =
    `🔔 *TemuBarang*\n\n` +
    `Halo ${item.owner.name}, stiker QR barang Anda *${item.itemName}* baru saja dipindai seseorang.\n\n` +
    `Status barang: ${statusText}\n` +
    `Waktu scan: ${formatWaktu(now)}\n\n` +
    `Cek laporan penemu di dashboard:\n${env.FRONTEND_URL}/items/${item.id}`;

  return sendWhatsApp(item.owner.phone, message);
}

/** Notifikasi WhatsApp ke pemilik saat ada laporan/komentar baru dari penemu */
export async function sendCommentNotification(
  itemId: string,
  comment: { finderName: string | null; message: string; location: string | null }
): Promise<boolean> {
  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { owner: true } });
  if (!item) return false;

  const preview = comment.message.length > 160 ? comment.message.slice(0, 157) + '...' : comment.message;
  const message =
    `📩 *Laporan Baru - TemuBarang*\n\n` +
    `Ada laporan baru untuk barang *${item.itemName}*.\n\n` +
    `Dari: ${comment.finderName || 'Anonim'}\n` +
    (comment.location ? `Lokasi: ${comment.location}\n` : '') +
    `Pesan: "${preview}"\n\n` +
    `Baca selengkapnya: ${env.FRONTEND_URL}/items/${item.id}`;

  return sendWhatsApp(item.owner.phone, message);
}

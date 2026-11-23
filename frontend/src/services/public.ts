import { apiClient, withFallback, API_BASE_URL } from './api-client';
import * as mock from '@/mock/handlers';
import type { PublicItem, CreateCommentInput, Comment } from '@/types';

export const publicService = {
  getItem: (code: string): Promise<PublicItem | undefined> =>
    withFallback(() => apiClient<PublicItem>(`/public/items/${code}`), () => mock.mockGetItemByCode(code)),

  submitComment: (code: string, data: CreateCommentInput): Promise<Comment> =>
    withFallback(
      async () => {
        const res = await apiClient<{ comment: Comment }>(`/public/items/${code}/comments`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        return res.comment;
      },
      () => mock.mockSubmitComment(code, data)
    ),

  /** Bagikan perkiraan lokasi penemu ke pemilik (opsional, atas izin penemu) */
  shareLocation: async (code: string, latitude: number, longitude: number): Promise<void> => {
    await apiClient(`/public/items/${code}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  /** Endpoint redirect server → wa.me (nomor pemilik tidak pernah sampai ke browser) */
  getWhatsappRedirect: (code: string): Promise<string> =>
    Promise.resolve(`${API_BASE_URL}/public/items/${code}/whatsapp`),
};

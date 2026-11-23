import { apiClient, withFallback } from './api-client';
import * as mock from '@/mock/handlers';
import type { Item, CreateItemInput, UpdateItemInput, Comment, Scan } from '@/types';

function toFormData(data: UpdateItemInput): FormData {
  const formData = new FormData();
  if (data.ownerName !== undefined) formData.append('ownerName', data.ownerName);
  if (data.itemName !== undefined) formData.append('itemName', data.itemName);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.ownerMessage !== undefined) formData.append('ownerMessage', data.ownerMessage);
  if (data.allowWhatsapp !== undefined) formData.append('allowWhatsapp', String(data.allowWhatsapp));
  if (data.allowComments !== undefined) formData.append('allowComments', String(data.allowComments));
  if (data.photo) formData.append('photo', data.photo);
  return formData;
}

export const itemsService = {
  getAll: (): Promise<Item[]> => withFallback(() => apiClient<Item[]>('/items'), () => mock.mockGetItems()),

  getById: (id: string): Promise<Item | undefined> =>
    withFallback(() => apiClient<Item>(`/items/${id}`), () => mock.mockGetItem(id)),

  create: (data: CreateItemInput): Promise<Item> =>
    withFallback(
      () => apiClient<Item>('/items', { method: 'POST', body: toFormData(data) }),
      () => mock.mockCreateItem(data)
    ),

  update: (id: string, data: UpdateItemInput): Promise<Item> =>
    withFallback(
      () => apiClient<Item>(`/items/${id}`, { method: 'PATCH', body: toFormData(data) }),
      () => mock.mockUpdateItem(id, data)
    ),

  delete: (id: string): Promise<void> =>
    withFallback(
      async () => {
        await apiClient(`/items/${id}`, { method: 'DELETE' });
      },
      () => mock.mockDeleteItem(id)
    ),

  toggleStatus: (id: string): Promise<Item> =>
    withFallback(
      () => apiClient<Item>(`/items/${id}/status`, { method: 'PATCH' }),
      () => mock.mockToggleStatus(id)
    ),

  getComments: (itemId: string): Promise<Comment[]> =>
    withFallback(() => apiClient<Comment[]>(`/items/${itemId}/comments`), () => mock.mockGetComments(itemId)),

  markCommentRead: (commentId: string): Promise<void> =>
    withFallback(
      async () => {
        await apiClient(`/items/comments/${commentId}/read`, { method: 'PATCH' });
      },
      () => mock.mockMarkCommentRead(commentId)
    ),

  getScans: (itemId: string): Promise<Scan[]> =>
    withFallback(() => apiClient<Scan[]>(`/items/${itemId}/scans`), () => mock.mockGetScans(itemId)),
};

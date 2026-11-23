import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from '@/services/items';
import type { CreateItemInput, UpdateItemInput } from '@/types';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: itemsService.getAll,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemInput) => itemsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemInput }) => itemsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useToggleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsService.toggleStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', id] });
    },
  });
}

export function useItemComments(itemId: string) {
  return useQuery({
    queryKey: ['comments', itemId],
    queryFn: () => itemsService.getComments(itemId),
    enabled: !!itemId,
  });
}

export function useMarkCommentRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => itemsService.markCommentRead(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useItemScans(itemId: string) {
  return useQuery({
    queryKey: ['scans', itemId],
    queryFn: () => itemsService.getScans(itemId),
    enabled: !!itemId,
  });
}


import { useQuery, useMutation } from '@tanstack/react-query';
import { publicService } from '@/services/public';
import type { CreateCommentInput } from '@/types';

export function usePublicItem(code: string) {
  return useQuery({
    queryKey: ['public-item', code],
    queryFn: () => publicService.getItem(code),
    enabled: !!code,
  });
}

export function useSubmitComment(code: string) {
  return useMutation({
    mutationFn: (data: CreateCommentInput) => publicService.submitComment(code, data),
  });
}

export function useWhatsappRedirect(code: string) {
  return useQuery({
    queryKey: ['whatsapp-redirect', code],
    queryFn: () => publicService.getWhatsappRedirect(code),
    enabled: false,
  });
}


import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/services/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      // Jangan ulangi request yang memang ditolak server (404, 401, dll)
      retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
});

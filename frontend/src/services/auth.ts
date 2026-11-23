import { apiClient, withFallback, TOKEN_KEY } from './api-client';
import * as mock from '@/mock/handlers';
import type { LoginInput, RegisterInput, UpdateProfileInput, User } from '@/types';

function saveToken(token?: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export const authService = {
  login: (input: LoginInput): Promise<User> =>
    withFallback(
      async () => {
        const res = await apiClient<{ token: string; user: User }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        saveToken(res.token);
        return res.user;
      },
      () => mock.mockLogin(input)
    ),

  register: (input: RegisterInput): Promise<User> =>
    withFallback(
      async () => {
        const res = await apiClient<{ token: string; user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        saveToken(res.token);
        return res.user;
      },
      () => mock.mockRegister(input)
    ),

  getMe: async (): Promise<User> => {
    const res = await apiClient<{ user: User }>('/auth/me');
    return res.user;
  },

  updateProfile: (data: UpdateProfileInput): Promise<User> =>
    withFallback(
      async () => {
        const res = await apiClient<{ user: User }>('/auth/me', {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
        return res.user;
      },
      () => mock.mockUpdateUser({ name: data.name, phone: data.phone, email: data.email })
    ),

  /** Hapus akun permanen — wajib konfirmasi kata sandi */
  deleteAccount: (password: string): Promise<void> =>
    withFallback(
      async () => {
        await apiClient('/auth/me', { method: 'DELETE', body: JSON.stringify({ password }) });
      },
      async () => undefined
    ),

  logout: async (): Promise<void> => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // abaikan: sesi lokal tetap dihapus
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

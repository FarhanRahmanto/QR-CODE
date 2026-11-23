import { apiClient, withFallback, TOKEN_KEY } from './api-client';
import * as mock from '@/mock/handlers';
import type { LoginInput, RegisterInput, UpdateProfileInput, User } from '@/types';

type OtpPurpose = 'login' | 'register' | 'change-phone';

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

  /** Minta OTP. Saat backend dalam mode dev, `devCode` berisi kode OTP-nya. */
  requestOTP: (phone: string, purpose: OtpPurpose = 'login'): Promise<{ success: boolean; devCode?: string }> =>
    withFallback(
      () =>
        apiClient<{ success: boolean; devCode?: string }>('/auth/otp/request', {
          method: 'POST',
          body: JSON.stringify({ phone, purpose }),
        }),
      async () => ({ ...(await mock.mockRequestOTP(phone)), devCode: '123456' })
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

  deleteAccount: (): Promise<void> =>
    withFallback(
      async () => {
        await apiClient('/auth/me', { method: 'DELETE' });
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

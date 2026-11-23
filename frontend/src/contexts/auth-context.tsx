import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { User, LoginInput, RegisterInput, UpdateProfileInput } from '@/types';
import { authService } from '@/services/auth';
import { ApiError, TOKEN_KEY, UNAUTHORIZED_EVENT } from '@/services/api-client';
import { queryClient } from '@/lib/query-client';

const USER_KEY = 'barang-hilang-user';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateProfileInput) => Promise<User>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function loadUser(): User | null {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    setUser(null);
  }, []);

  // Token kedaluwarsa / akun dihapus → keluar otomatis
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession);
  }, [clearSession]);

  // Sinkronkan profil terbaru dari server saat aplikasi dibuka
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService
      .getMe()
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) clearSession();
      });
  }, [clearSession]);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      queryClient.clear();
      setUser(await authService.login(input));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      queryClient.clear();
      setUser(await authService.register(input));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    clearSession();
  };

  const updateUser = async (data: UpdateProfileInput) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

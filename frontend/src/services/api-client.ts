// Default '/api' → diproksikan Vite ke backend (dev) atau Nginx (produksi), jadi satu domain.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const TOKEN_KEY = 'barang-hilang-token';
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

/** Error dari backend (server merespons dengan status non-2xx) */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Vite/Nginx mengembalikan 502/504 jika backend mati → anggap offline
  if (response.status === 502 || response.status === 504) {
    throw new TypeError('Backend tidak dapat dihubungi');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(response.status, errorData.error || `Terjadi kesalahan (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Pakai API asli; data mock HANYA dipakai jika backend tidak bisa dihubungi
 * (mode demo offline). Error validasi/autentikasi dari server tetap diteruskan.
 */
export async function withFallback<T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.warn('[Mode Demo] Backend offline, memakai data mock:', err);
    return mockCall();
  }
}

/** Ambil pesan error yang ramah untuk ditampilkan di toast */
export function getErrorMessage(err: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

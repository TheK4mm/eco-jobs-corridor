import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const TOKEN_KEY = 'corredor_token';
const REFRESH_KEY = 'corredor_refresh_token';

// ── Almacenamiento de la sesión (access + refresh token) ────────────────
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_KEY);

/** Guarda el par de tokens devuelto por login/refresh. */
export const setSession = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

/** Limpia toda la sesión local. */
export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el access token a cada petición.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Refresco de token con deduplicación: si llegan varios 401 a la vez, todos
 * comparten una sola llamada a /auth/refresh en curso. Se usa una instancia
 * axios "limpia" para evitar recursión con los interceptores.
 */
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    setSession(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function forceLogout(): void {
  clearSession();
  window.dispatchEvent(new Event('auth:logout'));
}

// Manejo global de 401: intenta refrescar una vez y reintentar; si no, cierra sesión.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error);

    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const isAuthCall =
      original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login');

    if (status === 401 && !original._retry && !isAuthCall && getRefreshToken()) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      forceLogout();
    } else if (status === 401 && getToken() && !getRefreshToken()) {
      forceLogout();
    }

    return Promise.reject(error);
  },
);

/** Extrae un mensaje de error legible de una respuesta de la API. */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

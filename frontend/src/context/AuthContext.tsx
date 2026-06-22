import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import * as authApi from '@/api/auth.api';
import { clearSession, getRefreshToken, getToken, setSession } from '@/api/client';
import type { Rol, Usuario } from '@/types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura la sesión a partir del token guardado. Si el access token expiró,
  // el interceptor de axios intentará refrescarlo de forma transparente.
  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((u) => active && setUser(u))
      .catch(() => clearSession())
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Reacciona a expiración de sesión detectada por el interceptor de axios.
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = useCallback(async (email: string, contrasena: string) => {
    const res = await authApi.login(email, contrasena);
    setSession(res.accessToken, res.refreshToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (data: { nombre: string; email: string; contrasena: string; rol: Rol }) => {
      await authApi.register(data);
    },
    [],
  );

  const logout = useCallback(() => {
    // Revoca el refresh token en el servidor (best-effort) y limpia la sesión local.
    const refreshToken = getRefreshToken();
    if (refreshToken) void authApi.logout(refreshToken).catch(() => undefined);
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

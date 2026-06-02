import { createContext } from 'react';
import type { Rol, Usuario } from '@/types';

export interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, contrasena: string) => Promise<Usuario>;
  register: (data: {
    nombre: string;
    email: string;
    contrasena: string;
    rol: Rol;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

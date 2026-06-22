import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Leaf, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUnreadCount } from '@/api/notifications.api';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { to: '/ofertas', label: 'Ofertas', show: true },
    { to: '/candidato/postulaciones', label: 'Mis postulaciones', show: user?.rol === 'candidato' },
    { to: '/empleador/ofertas', label: 'Mis ofertas', show: user?.rol === 'empleador' },
    { to: '/admin', label: 'Panel admin', show: user?.rol === 'admin' },
  ].filter((l) => l.show);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium',
      isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100',
    );

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-brand-700">
          <Leaf className="h-7 w-7 shrink-0" aria-hidden="true" />
          <span className="font-bold leading-tight">
            Corredor Ecológico
            <span className="block text-xs font-normal text-gray-500">
              Empleos · Villavicencio
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/notificaciones"
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {Boolean(unread?.count) && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread!.count}
                  </span>
                )}
              </Link>
              <Link to="/perfil" className="text-sm font-medium text-gray-700 hover:text-brand-700">
                {user.nombre}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link to="/registro">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={navLinkClass}>
                {l.label}
              </NavLink>
            ))}
            <hr className="my-2" />
            {user ? (
              <>
                <NavLink
                  to="/notificaciones"
                  onClick={() => setOpen(false)}
                  className={navLinkClass}
                >
                  Notificaciones {Boolean(unread?.count) && `(${unread!.count})`}
                </NavLink>
                <NavLink to="/perfil" onClick={() => setOpen(false)} className={navLinkClass}>
                  Mi perfil
                </NavLink>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className={navLinkClass({ isActive: false })}>
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

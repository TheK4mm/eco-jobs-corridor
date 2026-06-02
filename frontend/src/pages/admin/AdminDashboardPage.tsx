import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, FileText, FolderTree, Users } from 'lucide-react';
import { getStats } from '@/api/admin.api';
import { Button, Card, PageLoader } from '@/components/ui';

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: getStats });
  if (isLoading) return <PageLoader />;

  const cards = [
    { label: 'Usuarios', value: data?.usuarios.total ?? 0, icon: Users },
    { label: 'Ofertas', value: data?.ofertas.total ?? 0, icon: Briefcase },
    { label: 'Postulaciones', value: data?.postulaciones.total ?? 0, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Panel administrativo</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <Icon className="h-10 w-10 text-brand-500" aria-hidden="true" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg">Usuarios por rol</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {data?.usuarios.por_rol.map((r) => (
              <li key={r.rol} className="flex justify-between">
                <span className="capitalize text-gray-600">{r.rol}</span>
                <span className="font-medium">{r.total}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg">Postulaciones por estado</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {data?.postulaciones.por_estado.map((r) => (
              <li key={r.estado} className="flex justify-between">
                <span className="capitalize text-gray-600">{r.estado.replace(/_/g, ' ')}</span>
                <span className="font-medium">{r.total}</span>
              </li>
            ))}
            {data?.postulaciones.total === 0 && <li className="text-gray-400">Sin postulaciones</li>}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/usuarios">
          <Button variant="outline">
            <Users className="h-4 w-4" /> Gestionar usuarios
          </Button>
        </Link>
        <Link to="/admin/ofertas">
          <Button variant="outline">
            <Briefcase className="h-4 w-4" /> Gestionar ofertas
          </Button>
        </Link>
        <Link to="/admin/categorias">
          <Button variant="outline">
            <FolderTree className="h-4 w-4" /> Gestionar categorías
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CandidateProfileForm } from '@/components/profiles/CandidateProfileForm';
import { EmployerProfileForm } from '@/components/profiles/EmployerProfileForm';
import { Card } from '@/components/ui';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl">Mi perfil</h1>

      <Card className="p-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Nombre</dt>
            <dd className="font-medium">{user.nombre}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Correo</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Rol</dt>
            <dd className="font-medium capitalize">{user.rol}</dd>
          </div>
        </dl>
      </Card>

      {user.rol === 'candidato' && <CandidateProfileForm />}
      {user.rol === 'empleador' && <EmployerProfileForm />}
      {user.rol === 'admin' && (
        <Card className="p-6 text-sm text-gray-600">
          Cuenta de administrador. Gestiona la plataforma desde el{' '}
          <Link to="/admin" className="font-medium text-brand-700 hover:underline">
            panel administrativo
          </Link>
          .
        </Card>
      )}
    </div>
  );
}

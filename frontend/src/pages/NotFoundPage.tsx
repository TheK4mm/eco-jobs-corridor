import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl">Página no encontrada</h1>
      <p className="mt-2 text-gray-500">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listMyApplications, withdrawApplication } from '@/api/applications.api';
import { Button, Card, EmptyState, PageLoader } from '@/components/ui';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';

export function MyApplicationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => listMyApplications({ limit: 50 }),
  });

  const withdraw = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      toast.success('Postulación retirada');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Mis postulaciones</h1>

      {data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((p) => (
            <Card
              key={p.id_postulacion}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <Link
                  to={`/ofertas/${p.id_oferta}`}
                  className="font-semibold text-gray-900 hover:text-brand-700"
                >
                  {p.titulo}
                </Link>
                <p className="text-sm text-gray-500">
                  {[p.empresa, p.ubicacion].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Postulado el {formatDate(p.fecha_postulacion)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge estado={p.estado} />
                <Link to={`/mensajes/${p.id_postulacion}`}>
                  <Button variant="outline" size="sm">
                    Mensajes
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => withdraw.mutate(p.id_postulacion)}
                >
                  Retirar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aún no te has postulado"
          description="Explora las ofertas y postúlate a las que te interesen."
          action={
            <Link to="/ofertas">
              <Button>Ver ofertas</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { deleteJob, listMyJobs } from '@/api/jobs.api';
import { Badge, Button, Card, EmptyState, PageLoader } from '@/components/ui';
import { ESTADO_OFERTA_COLOR, ESTADO_OFERTA_LABEL, formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';

export function MyJobsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => listMyJobs({ limit: 50 }),
  });

  const del = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success('Oferta eliminada');
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Mis ofertas</h1>
        <Link to="/empleador/ofertas/nueva">
          <Button>
            <Plus className="h-4 w-4" /> Nueva oferta
          </Button>
        </Link>
      </div>

      {data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((o) => (
            <Card key={o.id_oferta} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/ofertas/${o.id_oferta}`}
                    className="font-semibold text-gray-900 hover:text-brand-700"
                  >
                    {o.titulo}
                  </Link>
                  <Badge className={ESTADO_OFERTA_COLOR[o.estado]}>
                    {ESTADO_OFERTA_LABEL[o.estado]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {o.ubicacion} · {formatDate(o.fecha_publicacion)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/empleador/ofertas/${o.id_oferta}/postulaciones`}>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4" /> Postulantes
                  </Button>
                </Link>
                <Link to={`/empleador/ofertas/${o.id_oferta}/editar`}>
                  <Button variant="outline" size="sm" aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  aria-label="Eliminar"
                  onClick={() => {
                    if (window.confirm('¿Eliminar esta oferta? Esta acción no se puede deshacer.')) {
                      del.mutate(o.id_oferta);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No has publicado ofertas"
          description="Crea tu primera oferta para empezar a recibir postulaciones."
          action={
            <Link to="/empleador/ofertas/nueva">
              <Button>Publicar oferta</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Briefcase, Building2, Calendar, MapPin, Pencil } from 'lucide-react';
import { getJob } from '@/api/jobs.api';
import { apply } from '@/api/applications.api';
import { Badge, Button, Card, EmptyState, PageLoader, Textarea } from '@/components/ui';
import {
  CONTRATO_LABEL,
  ESTADO_OFERTA_COLOR,
  ESTADO_OFERTA_LABEL,
  MODALIDAD_LABEL,
  formatDate,
  formatSalary,
} from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/api/client';

export function JobDetailPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mensaje, setMensaje] = useState('');
  const [showForm, setShowForm] = useState(false);

  const {
    data: oferta,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !Number.isNaN(jobId),
  });

  const applyMutation = useMutation({
    mutationFn: () => apply(jobId, mensaje || undefined),
    onSuccess: () => {
      toast.success('¡Postulación enviada con éxito!');
      setShowForm(false);
      setMensaje('');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'No se pudo enviar la postulación')),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !oferta) {
    return (
      <EmptyState
        title="Oferta no encontrada"
        description="La oferta no existe o fue retirada."
        action={
          <Link to="/ofertas">
            <Button>Volver a ofertas</Button>
          </Link>
        }
      />
    );
  }

  const isOwner = Boolean(user && (user.id_usuario === oferta.id_empleador || user.rol === 'admin'));
  const canApply = user?.rol === 'candidato';

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to="/ofertas"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a ofertas
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl">{oferta.titulo}</h1>
            <p className="mt-1 text-gray-500">{oferta.empresa ?? oferta.empleador}</p>
          </div>
          <Badge className={ESTADO_OFERTA_COLOR[oferta.estado]}>
            {ESTADO_OFERTA_LABEL[oferta.estado]}
          </Badge>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600" /> {oferta.ubicacion}
          </span>
          <span className="inline-flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-600" /> {MODALIDAD_LABEL[oferta.modalidad]} ·{' '}
            {CONTRATO_LABEL[oferta.tipo_contrato]}
          </span>
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600" /> Publicada el{' '}
            {formatDate(oferta.fecha_publicacion)}
          </span>
          {oferta.categoria && (
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-600" /> {oferta.categoria}
            </span>
          )}
        </div>

        <p className="mt-4 text-lg font-semibold text-brand-700">
          {formatSalary(oferta.salario_min, oferta.salario_max)}
        </p>

        <hr className="my-5" />
        <h2 className="text-lg">Descripción</h2>
        <p className="mt-2 whitespace-pre-line text-gray-700">{oferta.descripcion}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {isOwner && (
            <Link to={`/empleador/ofertas/${oferta.id_oferta}/editar`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4" /> Editar oferta
              </Button>
            </Link>
          )}
          {canApply && !showForm && <Button onClick={() => setShowForm(true)}>Postularme</Button>}
          {!user && (
            <Link to="/login" state={{ from: { pathname: `/ofertas/${oferta.id_oferta}` } }}>
              <Button>Inicia sesión para postularte</Button>
            </Link>
          )}
        </div>

        {canApply && showForm && (
          <div className="mt-4 rounded-lg border border-gray-200 p-4">
            <Textarea
              label="Mensaje al empleador (opcional)"
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Cuéntale por qué eres un buen candidato..."
            />
            <div className="mt-3 flex gap-2">
              <Button onClick={() => applyMutation.mutate()} loading={applyMutation.isPending}>
                Enviar postulación
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

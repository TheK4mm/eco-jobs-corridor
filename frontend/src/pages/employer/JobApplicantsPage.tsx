import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { getJob, listJobApplications } from '@/api/jobs.api';
import { updateApplicationStatus } from '@/api/applications.api';
import { Card, EmptyState, PageLoader, Select } from '@/components/ui';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { ESTADO_POSTULACION_LABEL, formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';
import type { EstadoPostulacion } from '@/types';

export function JobApplicantsPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const queryClient = useQueryClient();

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !Number.isNaN(jobId),
  });
  const { data, isLoading } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => listJobApplications(jobId, { limit: 100 }),
    enabled: !Number.isNaN(jobId),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: number; estado: EstadoPostulacion }) =>
      updateApplicationStatus(vars.id, vars.estado),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <Link
        to="/empleador/ofertas"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Mis ofertas
      </Link>
      <h1 className="text-2xl">Postulantes{job ? ` · ${job.titulo}` : ''}</h1>

      {data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((p) => (
            <Card
              key={p.id_postulacion}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{p.candidato}</p>
                <p className="text-sm text-gray-500">{p.candidato_email}</p>
                {p.mensaje && <p className="mt-1 text-sm text-gray-600">“{p.mensaje}”</p>}
                <p className="mt-1 text-xs text-gray-400">
                  Postuló el {formatDate(p.fecha_postulacion)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge estado={p.estado} />
                <Select
                  value={p.estado}
                  aria-label={`Cambiar estado de ${p.candidato}`}
                  onChange={(e) =>
                    mutation.mutate({
                      id: p.id_postulacion,
                      estado: e.target.value as EstadoPostulacion,
                    })
                  }
                >
                  {Object.entries(ESTADO_POSTULACION_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin postulantes aún"
          description="Cuando alguien se postule a esta oferta aparecerá aquí."
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listAllJobs } from '@/api/admin.api';
import { deleteJob } from '@/api/jobs.api';
import { Badge, Button, Card, EmptyState, PageLoader, Pagination, Select } from '@/components/ui';
import { ESTADO_OFERTA_COLOR, ESTADO_OFERTA_LABEL, formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';

export function AdminJobsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', page, estado],
    queryFn: () => listAllJobs({ page, limit: 10, estado: estado || undefined }),
  });

  const del = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success('Oferta eliminada');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Ofertas (todas)</h1>
        <Select
          value={estado}
          aria-label="Filtrar por estado"
          onChange={(e) => {
            setEstado(e.target.value);
            setPage(1);
          }}
          className="max-w-[200px]"
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="cerrada">Cerrada</option>
          <option value="borrador">Borrador</option>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : data && data.data.length > 0 ? (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">Título</th>
                  <th className="p-3">Empleador</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Publicada</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((o) => (
                  <tr key={o.id_oferta} className="border-b last:border-0">
                    <td className="p-3 font-medium">
                      <Link to={`/ofertas/${o.id_oferta}`} className="hover:text-brand-700">
                        {o.titulo}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-600">{o.empleador ?? o.empresa}</td>
                    <td className="p-3">
                      <Badge className={ESTADO_OFERTA_COLOR[o.estado]}>
                        {ESTADO_OFERTA_LABEL[o.estado]}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-500">{formatDate(o.fecha_publicacion)}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la oferta "${o.titulo}"?`)) {
                            del.mutate(o.id_oferta);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={setPage}
          />
        </>
      ) : (
        <EmptyState title="Sin ofertas" description="No hay ofertas con ese filtro." />
      )}
    </div>
  );
}

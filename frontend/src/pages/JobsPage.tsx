import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { listJobs, type JobQuery } from '@/api/jobs.api';
import { listCategories } from '@/api/catalog.api';
import { JobCard } from '@/components/jobs/JobCard';
import { Button, Card, EmptyState, Input, PageLoader, Pagination, Select } from '@/components/ui';
import { CONTRATO_LABEL, MODALIDAD_LABEL } from '@/lib/format';

const LIMIT = 9;

export function JobsPage() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [filters, setFilters] = useState<JobQuery>({ q: initialQ || undefined, page: 1, limit: LIMIT });
  const [draft, setDraft] = useState({
    q: initialQ,
    id_categoria: '',
    ubicacion: '',
    modalidad: '',
    tipo_contrato: '',
  });

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: listCategories });
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => listJobs(filters),
  });

  const applyFilters = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilters({
      page: 1,
      limit: LIMIT,
      q: draft.q || undefined,
      id_categoria: draft.id_categoria ? Number(draft.id_categoria) : undefined,
      ubicacion: draft.ubicacion || undefined,
      modalidad: draft.modalidad || undefined,
      tipo_contrato: draft.tipo_contrato || undefined,
    });
  };

  const resetFilters = () => {
    setDraft({ q: '', id_categoria: '', ubicacion: '', modalidad: '', tipo_contrato: '' });
    setFilters({ page: 1, limit: LIMIT });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Ofertas de empleo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Explora las oportunidades disponibles en el Corredor Ecológico.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <Input
              label="Palabra clave"
              placeholder="Cargo, descripción..."
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Input
              label="Ubicación"
              placeholder="Ciudad / municipio"
              value={draft.ubicacion}
              onChange={(e) => setDraft({ ...draft, ubicacion: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Select
              label="Categoría"
              value={draft.id_categoria}
              onChange={(e) => setDraft({ ...draft, id_categoria: e.target.value })}
            >
              <option value="">Todas</option>
              {categorias?.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select
              label="Modalidad"
              value={draft.modalidad}
              onChange={(e) => setDraft({ ...draft, modalidad: e.target.value })}
            >
              <option value="">Todas</option>
              {Object.entries(MODALIDAD_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-4">
            <Select
              label="Tipo de contrato"
              value={draft.tipo_contrato}
              onChange={(e) => setDraft({ ...draft, tipo_contrato: e.target.value })}
            >
              <option value="">Todos</option>
              {Object.entries(CONTRATO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end gap-2 md:col-span-8">
            <Button type="submit">
              <Search className="h-4 w-4" /> Buscar
            </Button>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Limpiar
            </Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <EmptyState
          title="No se pudieron cargar las ofertas"
          description="Verifica que el servidor backend esté activo e inténtalo de nuevo."
        />
      ) : data && data.data.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">{data.pagination.total} oferta(s) encontradas</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((oferta) => (
              <JobCard key={oferta.id_oferta} oferta={oferta} />
            ))}
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </>
      ) : (
        <EmptyState
          title="Sin resultados"
          description="No encontramos ofertas con esos criterios. Prueba con otros filtros."
        />
      )}
    </div>
  );
}

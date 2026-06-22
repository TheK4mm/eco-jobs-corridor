import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Globe, MapPin } from 'lucide-react';
import { getEmployer } from '@/api/profiles.api';
import { listJobs } from '@/api/jobs.api';
import { JobCard } from '@/components/jobs/JobCard';
import { Card, EmptyState, PageLoader } from '@/components/ui';

export function CompanyPage() {
  const { id } = useParams();
  const userId = Number(id);

  const {
    data: empresa,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['company', userId],
    queryFn: () => getEmployer(userId),
    enabled: !Number.isNaN(userId),
  });

  const { data: ofertas } = useQuery({
    queryKey: ['company-jobs', userId],
    queryFn: () => listJobs({ id_empleador: userId, limit: 50 }),
    enabled: !Number.isNaN(userId),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !empresa) {
    return (
      <EmptyState
        title="Empresa no encontrada"
        description="El perfil que buscas no existe."
        action={
          <Link to="/ofertas" className="text-brand-700 hover:underline">
            Ver ofertas
          </Link>
        }
      />
    );
  }

  const { usuario, perfil } = empresa;
  const nombre = perfil?.nombre_empresa ?? usuario.nombre;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to="/ofertas"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a ofertas
      </Link>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          {perfil?.logo_url ? (
            <img src={perfil.logo_url} alt={nombre} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Building2 className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          <div>
            <h1 className="text-2xl">{nombre}</h1>
            {perfil?.sector && <p className="text-sm text-gray-500">{perfil.sector}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              {perfil?.ubicacion && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {perfil.ubicacion}
                </span>
              )}
              {perfil?.sitio_web && (
                <a
                  href={perfil.sitio_web}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" /> Sitio web
                </a>
              )}
            </div>
          </div>
        </div>
        {perfil?.descripcion && (
          <p className="mt-4 whitespace-pre-line text-gray-700">{perfil.descripcion}</p>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Ofertas activas</h2>
        {ofertas && ofertas.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {ofertas.data.map((oferta) => (
              <JobCard key={oferta.id_oferta} oferta={oferta} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin ofertas activas"
            description="Esta empresa no tiene ofertas publicadas por ahora."
          />
        )}
      </div>
    </div>
  );
}

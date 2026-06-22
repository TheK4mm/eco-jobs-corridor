import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listSavedJobs } from '@/api/saved.api';
import { JobCard } from '@/components/jobs/JobCard';
import { Button, EmptyState, Pagination, PageLoader } from '@/components/ui';

export function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs', page],
    queryFn: () => listSavedJobs({ page, limit: 9 }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Empleos guardados</h1>

      {data && data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((oferta) => (
              <JobCard key={oferta.id_oferta} oferta={oferta} />
            ))}
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title="No tienes ofertas guardadas"
          description="Guarda las ofertas que te interesen para revisarlas más tarde."
          action={
            <Link to="/ofertas">
              <Button>Explorar ofertas</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

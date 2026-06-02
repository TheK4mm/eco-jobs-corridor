import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, Search, Users } from 'lucide-react';
import { listJobs } from '@/api/jobs.api';
import { JobCard } from '@/components/jobs/JobCard';
import { Button, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: Briefcase, title: 'Ofertas reales', desc: 'Publicadas por empleadores de la región.' },
  { icon: Users, title: 'Para candidatos', desc: 'Postúlate y haz seguimiento a tu proceso.' },
  { icon: Building2, title: 'Para empresas', desc: 'Gestiona ofertas y postulantes fácilmente.' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'featured'],
    queryFn: () => listJobs({ limit: 6 }),
  });

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/ofertas?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Encuentra empleo en el Corredor Ecológico
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-50">
          Conectamos a los habitantes de Villavicencio – Meta con oportunidades laborales
          sostenibles.
        </p>
        <form onSubmit={onSearch} className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca por cargo, palabra clave..."
            aria-label="Buscar empleos"
            className="w-full rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-white"
          />
          <Button type="submit" size="lg" variant="secondary">
            <Search className="h-5 w-5" /> Buscar
          </Button>
        </form>
        {!user && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/registro">
              <Button variant="secondary">Crear cuenta</Button>
            </Link>
            <Link to="/ofertas">
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Ver ofertas
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-5 text-center">
            <Icon className="mx-auto h-8 w-8 text-brand-600" aria-hidden="true" />
            <h3 className="mt-2">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Ofertas recientes</h2>
          <Link to="/ofertas" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todas
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((oferta) => (
              <JobCard key={oferta.id_oferta} oferta={oferta} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Briefcase, Building2, MapPin } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import {
  CONTRATO_LABEL,
  ESTADO_OFERTA_COLOR,
  ESTADO_OFERTA_LABEL,
  MODALIDAD_LABEL,
  formatSalary,
} from '@/lib/format';
import type { Oferta } from '@/types';

export function JobCard({ oferta, showEstado = false }: { oferta: Oferta; showEstado?: boolean }) {
  return (
    <Card className="flex h-full flex-col p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/ofertas/${oferta.id_oferta}`}
          className="text-lg font-semibold text-gray-900 hover:text-brand-700"
        >
          {oferta.titulo}
        </Link>
        {showEstado && (
          <Badge className={ESTADO_OFERTA_COLOR[oferta.estado]}>
            {ESTADO_OFERTA_LABEL[oferta.estado]}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          {oferta.empresa ?? oferta.empleador ?? 'Empresa'}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {oferta.ubicacion}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          {MODALIDAD_LABEL[oferta.modalidad]}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm text-gray-600">{oferta.descripcion}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-brand-700">
          {formatSalary(oferta.salario_min, oferta.salario_max)}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {oferta.categoria && <Badge className="bg-gray-100 text-gray-600">{oferta.categoria}</Badge>}
          <Badge className="bg-brand-50 text-brand-700">{CONTRATO_LABEL[oferta.tipo_contrato]}</Badge>
        </div>
      </div>
    </Card>
  );
}

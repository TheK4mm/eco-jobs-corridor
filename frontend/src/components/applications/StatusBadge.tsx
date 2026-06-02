import { Badge } from '@/components/ui';
import { ESTADO_POSTULACION_COLOR, ESTADO_POSTULACION_LABEL } from '@/lib/format';
import type { EstadoPostulacion } from '@/types';

export function StatusBadge({ estado }: { estado: EstadoPostulacion }) {
  return (
    <Badge className={ESTADO_POSTULACION_COLOR[estado]}>{ESTADO_POSTULACION_LABEL[estado]}</Badge>
  );
}

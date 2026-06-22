import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { listAlerts, createAlert, deleteAlert, type AlertInput } from '@/api/alerts.api';
import { listCategories } from '@/api/catalog.api';
import { Badge, Button, Card, EmptyState, Input, PageLoader, Select } from '@/components/ui';
import { MODALIDAD_LABEL } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';

interface FormValues {
  palabra_clave: string;
  id_categoria: string;
  modalidad: string;
}

export function AlertsPage() {
  const queryClient = useQueryClient();
  const { data: alertas, isLoading } = useQuery({ queryKey: ['alerts'], queryFn: listAlerts });
  const { data: categorias } = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { palabra_clave: '', id_categoria: '', modalidad: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: AlertInput) => createAlert(data),
    onSuccess: () => {
      toast.success('Alerta creada');
      reset();
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      toast.success('Alerta eliminada');
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const onSubmit = (values: FormValues) => {
    const payload: AlertInput = {};
    if (values.palabra_clave.trim()) payload.palabra_clave = values.palabra_clave.trim();
    if (values.id_categoria) payload.id_categoria = Number(values.id_categoria);
    if (values.modalidad) payload.modalidad = values.modalidad;
    if (!payload.palabra_clave && !payload.id_categoria && !payload.modalidad) {
      toast.error('Define al menos un criterio');
      return;
    }
    createMutation.mutate(payload);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Alertas de empleo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Te avisaremos (en la app y por correo) cuando se publiquen ofertas que coincidan.
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Palabra clave"
            placeholder="Ej. desarrollador"
            {...register('palabra_clave')}
          />
          <Select label="Categoría" {...register('id_categoria')}>
            <option value="">Cualquiera</option>
            {categorias?.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Select label="Modalidad" {...register('modalidad')}>
            <option value="">Cualquiera</option>
            {Object.entries(MODALIDAD_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-3">
            <Button type="submit" loading={createMutation.isPending}>
              Crear alerta
            </Button>
          </div>
        </form>
      </Card>

      {alertas && alertas.length > 0 ? (
        <div className="space-y-3">
          {alertas.map((a) => (
            <Card key={a.id_alerta} className="flex items-center justify-between gap-3 p-4">
              <div className="flex flex-wrap gap-2">
                {a.palabra_clave && (
                  <Badge className="bg-brand-50 text-brand-700">“{a.palabra_clave}”</Badge>
                )}
                {a.categoria && <Badge className="bg-gray-100 text-gray-600">{a.categoria}</Badge>}
                {a.modalidad && (
                  <Badge className="bg-gray-100 text-gray-600">
                    {MODALIDAD_LABEL[a.modalidad]}
                  </Badge>
                )}
                {!a.palabra_clave && !a.categoria && !a.modalidad && (
                  <span className="text-sm text-gray-500">Todas las ofertas</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Eliminar alerta"
                onClick={() => removeMutation.mutate(a.id_alerta)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tienes alertas"
          description="Crea una alerta para recibir avisos de nuevas ofertas que te interesen."
        />
      )}
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createJob, getJob, updateJob, type JobInput } from '@/api/jobs.api';
import { listCategories } from '@/api/catalog.api';
import { Button, Card, Input, PageLoader, Select, Textarea } from '@/components/ui';
import { CONTRATO_LABEL, ESTADO_OFERTA_LABEL, MODALIDAD_LABEL } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';

const schema = z.object({
  titulo: z.string().min(4, 'Mínimo 4 caracteres').max(160),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres').max(5000),
  empresa: z.string().max(150).optional(),
  ubicacion: z.string().min(2, 'Indica la ubicación').max(120),
  id_categoria: z.string().optional(),
  modalidad: z.enum(['presencial', 'remoto', 'hibrido']),
  tipo_contrato: z.enum(['tiempo_completo', 'medio_tiempo', 'temporal', 'practica', 'freelance']),
  salario_min: z.string().optional(),
  salario_max: z.string().optional(),
  estado: z.enum(['activa', 'cerrada', 'borrador']),
  fecha_cierre: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function JobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const jobId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: listCategories });
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: isEdit && !Number.isNaN(jobId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      modalidad: 'presencial',
      tipo_contrato: 'tiempo_completo',
      estado: 'activa',
      ubicacion: 'Corredor Ecológico',
    },
  });

  useEffect(() => {
    if (!job) return;
    reset({
      titulo: job.titulo,
      descripcion: job.descripcion,
      empresa: job.empresa ?? '',
      ubicacion: job.ubicacion,
      id_categoria: job.id_categoria?.toString() ?? '',
      modalidad: job.modalidad,
      tipo_contrato: job.tipo_contrato,
      salario_min: job.salario_min?.toString() ?? '',
      salario_max: job.salario_max?.toString() ?? '',
      estado: job.estado,
      fecha_cierre: job.fecha_cierre ?? '',
    });
  }, [job, reset]);

  const toPayload = (v: FormValues): JobInput => ({
    titulo: v.titulo,
    descripcion: v.descripcion,
    empresa: v.empresa || null,
    ubicacion: v.ubicacion,
    id_categoria: v.id_categoria ? Number(v.id_categoria) : null,
    modalidad: v.modalidad,
    tipo_contrato: v.tipo_contrato,
    salario_min: v.salario_min ? Number(v.salario_min) : null,
    salario_max: v.salario_max ? Number(v.salario_max) : null,
    estado: v.estado,
    fecha_cierre: v.fecha_cierre || null,
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      isEdit ? updateJob(jobId, toPayload(v)) : createJob(toPayload(v)),
    onSuccess: () => {
      toast.success(isEdit ? 'Oferta actualizada' : 'Oferta creada');
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      navigate('/empleador/ofertas');
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl">{isEdit ? 'Editar oferta' : 'Nueva oferta'}</h1>
      <Card className="mt-4 p-6">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
          <Input label="Título *" error={errors.titulo?.message} {...register('titulo')} />
          <Textarea
            label="Descripción *"
            rows={5}
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Empresa" {...register('empresa')} />
            <Input label="Ubicación *" error={errors.ubicacion?.message} {...register('ubicacion')} />
            <Select label="Categoría" {...register('id_categoria')}>
              <option value="">Sin categoría</option>
              {categorias?.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </Select>
            <Select label="Modalidad" {...register('modalidad')}>
              {Object.entries(MODALIDAD_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <Select label="Tipo de contrato" {...register('tipo_contrato')}>
              {Object.entries(CONTRATO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <Select label="Estado" {...register('estado')}>
              {Object.entries(ESTADO_OFERTA_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <Input label="Salario mínimo (COP)" type="number" min={0} {...register('salario_min')} />
            <Input label="Salario máximo (COP)" type="number" min={0} {...register('salario_max')} />
            <Input label="Fecha de cierre" type="date" {...register('fecha_cierre')} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Guardar cambios' : 'Publicar oferta'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/empleador/ofertas')}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  type EmpleadorProfileInput,
  getMyEmployer,
  upsertMyEmployer,
} from '@/api/profiles.api';
import { Button, Card, Input, PageLoader, Textarea } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';

const schema = z.object({
  nombre_empresa: z.string().min(2, 'El nombre de la empresa es obligatorio').max(150),
  sector: z.string().max(100).optional(),
  descripcion: z.string().max(2000).optional(),
  sitio_web: z.string().url('URL inválida').max(200).optional().or(z.literal('')),
  ubicacion: z.string().max(120).optional(),
  telefono: z.string().max(30).optional(),
  logo_url: z.string().url('URL inválida').max(255).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function EmployerProfileForm() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile', 'employer'], queryFn: getMyEmployer });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!data) return;
    reset({
      nombre_empresa: data.perfil?.nombre_empresa ?? '',
      sector: data.perfil?.sector ?? '',
      descripcion: data.perfil?.descripcion ?? '',
      sitio_web: data.perfil?.sitio_web ?? '',
      ubicacion: data.perfil?.ubicacion ?? '',
      telefono: data.perfil?.telefono ?? '',
      logo_url: data.perfil?.logo_url ?? '',
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: EmpleadorProfileInput) => upsertMyEmployer(values),
    onSuccess: () => {
      toast.success('Perfil de empresa actualizado');
      queryClient.invalidateQueries({ queryKey: ['profile', 'employer'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const onSubmit = (v: FormValues) =>
    mutation.mutate({
      nombre_empresa: v.nombre_empresa,
      sector: v.sector || null,
      descripcion: v.descripcion || null,
      sitio_web: v.sitio_web || null,
      ubicacion: v.ubicacion || null,
      telefono: v.telefono || null,
      logo_url: v.logo_url || null,
    });

  if (isLoading) return <PageLoader />;

  return (
    <Card className="p-6">
      <h2 className="text-xl">Perfil de la empresa</h2>
      <p className="mt-1 text-sm text-gray-500">
        Esta información se mostrará a los candidatos en tus ofertas.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="Nombre de la empresa *"
          error={errors.nombre_empresa?.message}
          {...register('nombre_empresa')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Sector" {...register('sector')} />
          <Input label="Ubicación" {...register('ubicacion')} />
          <Input label="Teléfono" {...register('telefono')} />
          <Input
            label="Sitio web"
            type="url"
            placeholder="https://..."
            error={errors.sitio_web?.message}
            {...register('sitio_web')}
          />
        </div>
        <Input
          label="Logo (URL)"
          type="url"
          placeholder="https://..."
          error={errors.logo_url?.message}
          {...register('logo_url')}
        />
        <Textarea label="Descripción de la empresa" rows={4} {...register('descripcion')} />
        <Button type="submit" loading={mutation.isPending}>
          Guardar perfil
        </Button>
      </form>
    </Card>
  );
}

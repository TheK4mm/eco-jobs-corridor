import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  type CandidatoProfileInput,
  getMyCandidate,
  upsertMyCandidate,
} from '@/api/profiles.api';
import { listSkills } from '@/api/catalog.api';
import { Button, Card, Input, PageLoader, Textarea } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';
import { cn } from '@/lib/cn';

interface FormValues {
  telefono: string;
  titulo_profesional: string;
  resumen: string;
  ubicacion: string;
  experiencia_anios: string;
  url_cv: string;
}

export function CandidateProfileForm() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile', 'candidate'], queryFn: getMyCandidate });
  const { data: skills } = useQuery({ queryKey: ['skills'], queryFn: listSkills });
  const [selected, setSelected] = useState<number[]>([]);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (!data) return;
    reset({
      telefono: data.perfil?.telefono ?? '',
      titulo_profesional: data.perfil?.titulo_profesional ?? '',
      resumen: data.perfil?.resumen ?? '',
      ubicacion: data.perfil?.ubicacion ?? '',
      experiencia_anios: data.perfil?.experiencia_anios?.toString() ?? '',
      url_cv: data.perfil?.url_cv ?? '',
    });
    setSelected(data.habilidades.map((h) => h.id_categoria));
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: CandidatoProfileInput) => upsertMyCandidate(values),
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['profile', 'candidate'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const toggleSkill = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onSubmit = (v: FormValues) =>
    mutation.mutate({
      telefono: v.telefono || null,
      titulo_profesional: v.titulo_profesional || null,
      resumen: v.resumen || null,
      ubicacion: v.ubicacion || null,
      experiencia_anios: v.experiencia_anios ? Number(v.experiencia_anios) : null,
      url_cv: v.url_cv || null,
      habilidades: selected,
    });

  if (isLoading) return <PageLoader />;

  return (
    <Card className="p-6">
      <h2 className="text-xl">Perfil de candidato</h2>
      <p className="mt-1 text-sm text-gray-500">
        Completa tu información para destacar ante los empleadores.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Teléfono" {...register('telefono')} />
          <Input label="Título profesional" {...register('titulo_profesional')} />
          <Input label="Ubicación" {...register('ubicacion')} />
          <Input
            label="Años de experiencia"
            type="number"
            min={0}
            max={70}
            {...register('experiencia_anios')}
          />
        </div>
        <Input
          label="URL de tu hoja de vida (CV)"
          type="url"
          placeholder="https://..."
          {...register('url_cv')}
        />
        <Textarea label="Resumen profesional" rows={4} {...register('resumen')} />
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Habilidades</p>
          <div className="flex flex-wrap gap-2">
            {skills?.map((s) => (
              <button
                type="button"
                key={s.id_categoria}
                onClick={() => toggleSkill(s.id_categoria)}
                aria-pressed={selected.includes(s.id_categoria)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition',
                  selected.includes(s.id_categoria)
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50',
                )}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" loading={mutation.isPending}>
          Guardar perfil
        </Button>
      </form>
    </Card>
  );
}

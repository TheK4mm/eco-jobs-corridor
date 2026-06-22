import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Input } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';
import * as authApi from '@/api/auth.api';

const schema = z
  .object({
    contrasena: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
      .regex(/\d/, 'Debe incluir al menos un número'),
    confirmar: z.string(),
  })
  .refine((d) => d.contrasena === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await authApi.resetPassword(token, data.contrasena);
      toast.success('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'No se pudo restablecer la contraseña'));
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="text-2xl">Restablecer contraseña</h1>
        {!token ? (
          <p className="mt-4 text-sm text-red-600">
            El enlace no es válido o está incompleto. Solicita uno nuevo desde{' '}
            <Link to="/recuperar" className="font-medium text-brand-700 hover:underline">
              recuperar contraseña
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.contrasena?.message}
              {...register('contrasena')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmar?.message}
              {...register('confirmar')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Actualizar contraseña
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

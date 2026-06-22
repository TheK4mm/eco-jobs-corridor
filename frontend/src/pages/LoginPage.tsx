import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Input } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  contrasena: z.string().min(1, 'Ingresa tu contraseña'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const user = await login(data.email, data.contrasena);
      toast.success(`¡Bienvenido/a, ${user.nombre}!`);
      navigate(location.state?.from?.pathname ?? '/ofertas', { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'No se pudo iniciar sesión'));
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="text-2xl">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-gray-500">
          Accede para postularte a empleos o gestionar tus ofertas.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            error={errors.contrasena?.message}
            {...register('contrasena')}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Ingresar
          </Button>
        </form>
        <p className="mt-3 text-center text-sm">
          <Link to="/recuperar" className="text-brand-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-brand-700 hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}

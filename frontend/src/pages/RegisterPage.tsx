import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Input, Select } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  email: z.string().email('Correo inválido'),
  contrasena: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Incluye al menos una letra')
    .regex(/\d/, 'Incluye al menos un número'),
  rol: z.enum(['candidato', 'empleador']),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { rol: 'candidato' } });

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data);
      toast.success('Cuenta creada. Ahora inicia sesión.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'No se pudo completar el registro'));
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="text-2xl">Crear cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Regístrate como candidato para postularte, o como empleador para publicar ofertas.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input label="Nombre completo" error={errors.nombre?.message} {...register('nombre')} />
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
            autoComplete="new-password"
            error={errors.contrasena?.message}
            {...register('contrasena')}
          />
          <Select label="Tipo de cuenta" error={errors.rol?.message} {...register('rol')}>
            <option value="candidato">Candidato (busco empleo)</option>
            <option value="empleador">Empleador (publico ofertas)</option>
          </Select>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Registrarme
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}

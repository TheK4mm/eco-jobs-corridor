import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Input } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';
import * as authApi from '@/api/auth.api';

const schema = z.object({
  email: z.string().email('Correo inválido'),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  // En desarrollo el backend devuelve el token para poder probar sin correo.
  const [devLink, setDevLink] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await authApi.forgotPassword(data.email);
      setSent(true);
      setDevLink(res.resetToken ? `/restablecer?token=${res.resetToken}` : null);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'No se pudo procesar la solicitud'));
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="text-2xl">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md bg-brand-50 p-3 text-sm text-brand-800">
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            {devLink && (
              <p className="text-sm text-gray-600">
                (Modo desarrollo){' '}
                <Link to={devLink} className="font-medium text-brand-700 hover:underline">
                  Abrir enlace de restablecimiento
                </Link>
              </p>
            )}
            <Link to="/login" className="block text-sm font-medium text-brand-700 hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Enviar instrucciones
            </Button>
            <p className="text-center text-sm text-gray-600">
              <Link to="/login" className="font-medium text-brand-700 hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications.api';
import { Button, Card, EmptyState, PageLoader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications({ limit: 50 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-count'] });
  };

  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      invalidate();
      toast.success('Todas marcadas como leídas');
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Notificaciones</h1>
        <Button variant="outline" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
          <CheckCheck className="h-4 w-4" /> Marcar todas
        </Button>
      </div>

      {data && data.data.length > 0 ? (
        <div className="space-y-2">
          {data.data.map((n) => (
            <Card
              key={n.id_notificacion}
              className={cn('p-4', !n.leida && 'border-brand-200 bg-brand-50/40')}
            >
              <div className="flex items-start gap-3">
                <Bell
                  className={cn('mt-0.5 h-5 w-5 shrink-0', n.leida ? 'text-gray-400' : 'text-brand-600')}
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{n.titulo}</p>
                  <p className="text-sm text-gray-600">{n.mensaje}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(n.fecha_creacion)}</p>
                  {n.enlace && (
                    <Link
                      to={n.enlace}
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      Ver detalle
                    </Link>
                  )}
                </div>
                {!n.leida && (
                  <button
                    onClick={() => markOne.mutate(n.id_notificacion)}
                    className="text-xs font-medium text-brand-700 hover:underline"
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin notificaciones"
          description="Aquí verás avisos sobre tus postulaciones y ofertas."
        />
      )}
    </div>
  );
}

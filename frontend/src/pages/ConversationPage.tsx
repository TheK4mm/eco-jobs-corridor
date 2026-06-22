import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { getConversation, sendMessage } from '@/api/messages.api';
import { Button, Card, PageLoader, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { apiErrorMessage } from '@/api/client';

export function ConversationPage() {
  const { id } = useParams();
  const idPostulacion = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cuerpo, setCuerpo] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['conversation', idPostulacion],
    queryFn: () => getConversation(idPostulacion),
    enabled: !Number.isNaN(idPostulacion),
  });

  const mutation = useMutation({
    mutationFn: () => sendMessage(idPostulacion, cuerpo.trim()),
    onSuccess: () => {
      setCuerpo('');
      void queryClient.invalidateQueries({ queryKey: ['conversation', idPostulacion] });
      void queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-600">No se pudo cargar la conversación.</p>
      </Card>
    );
  }

  const onSend = () => {
    if (!cuerpo.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to="/notificaciones"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div>
        <h1 className="text-2xl">Conversación</h1>
        <p className="text-sm text-gray-500">
          {data.postulacion.titulo} · {data.postulacion.candidato}
        </p>
      </div>

      <Card className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto p-4">
        {data.mensajes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Aún no hay mensajes. ¡Escribe el primero!
          </p>
        ) : (
          data.mensajes.map((m) => {
            const mine = m.id_remitente === user?.id_usuario;
            return (
              <div
                key={m.id_mensaje}
                className={cn('flex', mine ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    mine ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800',
                  )}
                >
                  {!mine && <p className="text-xs font-semibold text-brand-700">{m.remitente}</p>}
                  <p className="whitespace-pre-line">{m.cuerpo}</p>
                </div>
              </div>
            );
          })
        )}
      </Card>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            rows={2}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
        </div>
        <Button onClick={onSend} loading={mutation.isPending} aria-label="Enviar mensaje">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { listSavedIds, saveJob, unsaveJob } from '@/api/saved.api';
import { apiErrorMessage } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Botón para guardar/quitar una oferta de favoritos. Solo se muestra a usuarios
 * autenticados; el estado (guardada o no) se deriva de la lista de ids guardados.
 */
export function SaveJobButton({ ofertaId }: { ofertaId: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ids } = useQuery({
    queryKey: ['saved-ids'],
    queryFn: listSavedIds,
    enabled: Boolean(user),
  });

  const saved = Boolean(ids?.includes(ofertaId));

  const mutation = useMutation({
    mutationFn: () => (saved ? unsaveJob(ofertaId) : saveJob(ofertaId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-ids'] });
      void queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      toast.success(saved ? 'Oferta quitada de guardados' : 'Oferta guardada');
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      aria-pressed={saved}
      className="inline-flex items-center gap-2 rounded-md border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
      {saved ? 'Guardada' : 'Guardar'}
    </button>
  );
}

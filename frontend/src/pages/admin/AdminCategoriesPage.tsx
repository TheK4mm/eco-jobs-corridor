import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { createCategory, deleteCategory, listCategories } from '@/api/catalog.api';
import { Button, Card, EmptyState, Input, PageLoader } from '@/components/ui';
import { apiErrorMessage } from '@/api/client';

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['categorias'], queryFn: listCategories });
  const [nombre, setNombre] = useState('');

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categorias'] });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Categoría creada');
      setNombre('');
      invalidate();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const delMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Categoría eliminada');
      invalidate();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nombre.trim()) createMut.mutate(nombre.trim());
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl">Categorías</h1>

      <Card className="p-4">
        <form className="flex gap-2" onSubmit={onSubmit}>
          <Input
            placeholder="Nueva categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Button type="submit" loading={createMut.isPending}>
            Agregar
          </Button>
        </form>
      </Card>

      {data && data.length > 0 ? (
        <Card className="divide-y divide-gray-100">
          {data.map((c) => (
            <div key={c.id_categoria} className="flex items-center justify-between p-3">
              <span className="text-gray-800">{c.nombre}</span>
              <Button
                size="sm"
                variant="danger"
                aria-label={`Eliminar ${c.nombre}`}
                onClick={() => {
                  if (window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) {
                    delMut.mutate(c.id_categoria);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState title="Sin categorías" description="Crea la primera categoría de empleo." />
      )}
    </div>
  );
}

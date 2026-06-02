import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  deleteUser,
  listUsers,
  updateUserRole,
  updateUserStatus,
  type UserQuery,
} from '@/api/admin.api';
import { Badge, Button, Card, EmptyState, Input, PageLoader, Pagination, Select } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import type { Rol } from '@/types';

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<UserQuery>({ page: 1, limit: 10 });
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', query],
    queryFn: () => listUsers(query),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const roleMut = useMutation({
    mutationFn: (vars: { id: number; rol: Rol }) => updateUserRole(vars.id, vars.rol),
    onSuccess: () => {
      toast.success('Rol actualizado');
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: number; activo: boolean }) => updateUserStatus(vars.id, vars.activo),
    onSuccess: () => {
      toast.success('Estado actualizado');
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const delMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado');
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, page: 1, q: q || undefined }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Usuarios</h1>

      <Card className="p-4">
        <form className="flex flex-wrap items-center gap-3" onSubmit={onSearch}>
          <Input
            placeholder="Buscar por nombre o correo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={query.rol ?? ''}
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                page: 1,
                rol: (e.target.value || undefined) as Rol | undefined,
              }))
            }
          >
            <option value="">Todos los roles</option>
            <option value="candidato">Candidato</option>
            <option value="empleador">Empleador</option>
            <option value="admin">Admin</option>
          </Select>
          <Button type="submit">Buscar</Button>
        </form>
      </Card>

      {isLoading ? (
        <PageLoader />
      ) : data && data.data.length > 0 ? (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Registro</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => {
                  const isSelf = u.id_usuario === me?.id_usuario;
                  return (
                    <tr key={u.id_usuario} className="border-b last:border-0">
                      <td className="p-3 font-medium">{u.nombre}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <Select
                          value={u.rol}
                          disabled={isSelf}
                          aria-label={`Rol de ${u.nombre}`}
                          className="py-1 text-xs"
                          onChange={(e) =>
                            roleMut.mutate({ id: u.id_usuario, rol: e.target.value as Rol })
                          }
                        >
                          <option value="candidato">Candidato</option>
                          <option value="empleador">Empleador</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </td>
                      <td className="p-3">
                        {u.activo ? (
                          <Badge className="bg-brand-100 text-brand-800">Activo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600">Inactivo</Badge>
                        )}
                      </td>
                      <td className="p-3 text-gray-500">{formatDate(u.fecha_registro)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSelf}
                            onClick={() =>
                              statusMut.mutate({ id: u.id_usuario, activo: !u.activo })
                            }
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isSelf}
                            onClick={() => {
                              if (window.confirm(`¿Eliminar a ${u.nombre}?`)) {
                                delMut.mutate(u.id_usuario);
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(page) => setQuery((prev) => ({ ...prev, page }))}
          />
        </>
      ) : (
        <EmptyState title="Sin usuarios" description="No hay usuarios que coincidan con la búsqueda." />
      )}
    </div>
  );
}

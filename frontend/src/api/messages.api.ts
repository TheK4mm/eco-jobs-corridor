import { api } from './client';
import type { Conversacion, Mensaje } from '@/types';

export const getConversation = (idPostulacion: number): Promise<Conversacion> =>
  api.get<Conversacion>(`/mensajes/${idPostulacion}`).then((r) => r.data);

export const sendMessage = (
  idPostulacion: number,
  cuerpo: string,
): Promise<{ message: string; mensajes: Mensaje[] }> =>
  api.post(`/mensajes/${idPostulacion}`, { cuerpo }).then((r) => r.data);

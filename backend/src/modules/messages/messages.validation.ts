import { z } from 'zod';

export const sendMessageSchema = z.object({
  cuerpo: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(2000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

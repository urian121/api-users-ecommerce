// Tipos para el endpoint create-user-attempt
import { createUserAttempt } from '@/drizzle/schema';

// Usar tipos inferidos de Drizzle - IP se obtiene automáticamente del servidor
export type CreateUserAttemptRequest = Pick<typeof createUserAttempt.$inferInsert, 'phoneNumber' | 'password'>;

export type CreateUserAttemptResponse = typeof createUserAttempt.$inferSelect;

export interface CreateUserAttemptError {
  error: string;
}
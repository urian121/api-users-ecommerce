// Tipos para el endpoint create-user-attempt
import { createUserAttempt } from '@/drizzle/schema';

// Usar tipos inferidos de Drizzle
export type CreateUserAttemptRequest = Pick<typeof createUserAttempt.$inferInsert, 'phoneNumber' | 'password'> & {
  ip?: string;
};

export type CreateUserAttemptResponse = typeof createUserAttempt.$inferSelect;

export interface CreateUserAttemptError {
  error: string;
}
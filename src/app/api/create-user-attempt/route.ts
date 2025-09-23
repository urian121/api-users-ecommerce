import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { createUserAttempt } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getClientIp } from '@/utils/get-client-ip';
import { 
  CreateUserAttemptRequest, 
  CreateUserAttemptResponse, 
  CreateUserAttemptError,
} from '@/types/create-user-attempt';

// GET /api/create-user-attempt
export async function GET(): Promise<NextResponse<CreateUserAttemptResponse[] | CreateUserAttemptError>> {
  try {
    const allAttempts = await db.select().from(createUserAttempt);
    return NextResponse.json(allAttempts);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al obtener los intentos' }, { status: 500 });
  }
}

// POST /api/create-user-attempt
export async function POST(request: NextRequest): Promise<NextResponse<CreateUserAttemptResponse | CreateUserAttemptError>> {
  try {
    const { phoneNumber, password }: CreateUserAttemptRequest = await request.json();
    const clientIp = getClientIp(request);
        
    if (!phoneNumber || !password) {
      return NextResponse.json({ error: 'phoneNumber y password son requeridos' }, { status: 400 });
    }

    // Verificar si el phoneNumber ya existe
    const existingAttempt = await db.select().from(createUserAttempt).where(eq(createUserAttempt.phoneNumber, phoneNumber));
    if (existingAttempt.length > 0) {
      return NextResponse.json({ error: 'El número de teléfono ya está registrado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [newAttempt] = await db.insert(createUserAttempt).values({
      ip: clientIp,
      phoneNumber,
      password: hashedPassword,
    }).returning();

    return NextResponse.json(newAttempt, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al crear el intento' }, { status: 500 });
  }
}
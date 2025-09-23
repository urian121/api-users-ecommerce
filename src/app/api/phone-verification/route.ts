import { NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerification, PhoneVerification } from '@/drizzle/schema';
import { PhoneVerificationError } from '@/types/phone-verification';

// GET /api/phone-verification - Obtener todas las verificaciones
export async function GET(): Promise<NextResponse<PhoneVerification[] | PhoneVerificationError>> {
  try {
    const allVerifications = await db.select().from(phoneVerification);
    return NextResponse.json(allVerifications);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al obtener verificaciones' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerificationUpdate } from '@/db';

// GET /api/email-verification-update - Obtener todas las actualizaciones de verificación de email
export async function GET() {
  try {
    const allUpdates = await db.select().from(emailVerificationUpdate);
    return NextResponse.json(allUpdates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las actualizaciones de verificación de email' },
      { status: 500 }
    );
  }
}

// POST /api/email-verification-update - Crear nueva actualización de verificación de email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos
    if (!body.userId || !body.email || !body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos userId, email, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const newUpdate = await db.insert(emailVerificationUpdate).values({
      userId: body.userId,
      email: body.email,
      code: body.code,
      validUntil: new Date(body.validUntil),
      verified: body.verified || false,
      codesSentCount: body.codesSentCount || 0,
      lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
    }).returning();

    return NextResponse.json(newUpdate[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la actualización de verificación de email' },
      { status: 500 }
    );
  }
}
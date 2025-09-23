import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerification } from '@/db';

// GET /api/email-verification - Obtener todas las verificaciones de email
export async function GET() {
  try {
    const allVerifications = await db.select().from(emailVerification);
    return NextResponse.json(allVerifications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las verificaciones de email' },
      { status: 500 }
    );
  }
}

// POST /api/email-verification - Crear nueva verificación de email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos
    if (!body.userId || !body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos userId, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const newVerification = await db.insert(emailVerification).values({
      userId: body.userId,
      code: body.code,
      validUntil: new Date(body.validUntil),
      verified: body.verified || false,
      codesSentCount: body.codesSentCount || 0,
      lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
    }).returning();

    return NextResponse.json(newVerification[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la verificación de email' },
      { status: 500 }
    );
  }
}
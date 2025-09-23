import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerification } from '@/db';

// GET /api/phone-verification - Obtener todas las verificaciones de teléfono
export async function GET() {
  try {
    const allVerifications = await db.select().from(phoneVerification);
    return NextResponse.json(allVerifications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las verificaciones de teléfono' },
      { status: 500 }
    );
  }
}

// POST /api/phone-verification - Crear nueva verificación de teléfono
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos
    if (!body.ipId || !body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos ipId, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const newVerification = await db.insert(phoneVerification).values({
      ipId: body.ipId,
      code: body.code,
      validUntil: new Date(body.validUntil),
      verified: body.verified || false,
      codesSentCount: body.codesSentCount || 0,
      lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
    }).returning();

    return NextResponse.json(newVerification[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la verificación de teléfono' },
      { status: 500 }
    );
  }
}
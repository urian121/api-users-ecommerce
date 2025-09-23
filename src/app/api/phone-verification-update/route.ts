import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerificationUpdate } from '@/db';

// GET /api/phone-verification-update - Obtener todas las actualizaciones de verificación de teléfono
export async function GET() {
  try {
    const allUpdates = await db.select().from(phoneVerificationUpdate);
    return NextResponse.json(allUpdates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las actualizaciones de verificación de teléfono' },
      { status: 500 }
    );
  }
}

// POST /api/phone-verification-update - Crear nueva actualización de verificación de teléfono
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos
    if (!body.userId || !body.phoneNumber || !body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos userId, phoneNumber, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const newUpdate = await db.insert(phoneVerificationUpdate).values({
      userId: body.userId,
      phoneNumber: body.phoneNumber,
      code: body.code,
      validUntil: new Date(body.validUntil),
      verified: body.verified || false,
      codesSentCount: body.codesSentCount || 0,
      lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
    }).returning();

    return NextResponse.json(newUpdate[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la actualización de verificación de teléfono' },
      { status: 500 }
    );
  }
}
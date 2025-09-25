import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerificationUpdate } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';


// PUT /api/phone/update-phone/[id] - Actualizar verificación por ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { phoneNumber, code, validUntil, verified, codesSentCount, lastCodeSent } = await request.json();
    
    // 1. Validar ID
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    if (!phoneNumber || !code || !validUntil) {
      return NextResponse.json(
        { error: 'Los campos phoneNumber, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const updatedVerification = await db
      .update(phoneVerificationUpdate)
      .set({
        phoneNumber,
        code,
        validUntil: new Date(validUntil),
        verified: verified !== undefined ? verified : false,
        codesSentCount: codesSentCount || 0,
        lastCodeSent: lastCodeSent ? new Date(lastCodeSent) : null,
      })
      .where(eq(phoneVerificationUpdate.userId, id))
      .returning();

    if (updatedVerification.length === 0) {
      return NextResponse.json(
        { error: 'Actualización de verificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVerification[0]);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al actualizar la verificación' }, { status: 500 });
  }
}
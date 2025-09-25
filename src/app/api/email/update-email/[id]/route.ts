import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerificationUpdate } from '@/db';
import { eq } from 'drizzle-orm';

// PUT /api/email/update-email/[id] - Actualizar verificación por ID
export async function PUT( request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    if (!body.email || !body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos email, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const updatedVerification = await db
      .update(emailVerificationUpdate)
      .set({
        email: body.email,
        code: body.code,
        validUntil: new Date(body.validUntil),
        verified: body.verified !== undefined ? body.verified : false,
        codesSentCount: body.codesSentCount || 0,
        lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
      })
      .where(eq(emailVerificationUpdate.userId, id))
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
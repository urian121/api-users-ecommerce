import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerificationUpdate } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/phone-verification-update/[id] - Obtener actualización de verificación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const update = await db.select().from(phoneVerificationUpdate).where(eq(phoneVerificationUpdate.userId, id));
    
    if (update.length === 0) {
      return NextResponse.json(
        { error: 'Actualización de verificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(update[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la actualización de verificación' },
      { status: 500 }
    );
  }
}

// PUT /api/phone-verification-update/[id] - Actualizar verificación por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    if (!body.phoneNumber || !body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos phoneNumber, code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const updatedVerification = await db
      .update(phoneVerificationUpdate)
      .set({
        phoneNumber: body.phoneNumber,
        code: body.code,
        validUntil: new Date(body.validUntil),
        verified: body.verified !== undefined ? body.verified : false,
        codesSentCount: body.codesSentCount || 0,
        lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la verificación' },
      { status: 500 }
    );
  }
}

// DELETE /api/phone-verification-update/[id] - Eliminar actualización por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const deletedUpdate = await db
      .delete(phoneVerificationUpdate)
      .where(eq(phoneVerificationUpdate.userId, id))
      .returning();

    if (deletedUpdate.length === 0) {
      return NextResponse.json(
        { error: 'Actualización de verificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Actualización de verificación eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la actualización de verificación' },
      { status: 500 }
    );
  }
}
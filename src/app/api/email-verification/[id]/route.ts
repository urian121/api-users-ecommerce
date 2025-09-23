import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerification } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/email-verification/[id] - Obtener verificación de email por ID
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

    const verification = await db.select().from(emailVerification).where(eq(emailVerification.userId, id));
    
    if (verification.length === 0) {
      return NextResponse.json(
        { error: 'Verificación de email no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(verification[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la verificación de email' },
      { status: 500 }
    );
  }
}

// PUT /api/email-verification/[id] - Actualizar verificación de email por ID
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

    if (!body.code || !body.validUntil) {
      return NextResponse.json(
        { error: 'Los campos code y validUntil son requeridos' },
        { status: 400 }
      );
    }

    const updatedVerification = await db
      .update(emailVerification)
      .set({
        code: body.code,
        validUntil: new Date(body.validUntil),
        verified: body.verified !== undefined ? body.verified : false,
        codesSentCount: body.codesSentCount || 0,
        lastCodeSent: body.lastCodeSent ? new Date(body.lastCodeSent) : null,
      })
      .where(eq(emailVerification.userId, id))
      .returning();

    if (updatedVerification.length === 0) {
      return NextResponse.json(
        { error: 'Verificación de email no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVerification[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la verificación de email' },
      { status: 500 }
    );
  }
}

// DELETE /api/email-verification/[id] - Eliminar verificación de email por ID
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

    const deletedVerification = await db
      .delete(emailVerification)
      .where(eq(emailVerification.userId, id))
      .returning();

    if (deletedVerification.length === 0) {
      return NextResponse.json(
        { error: 'Verificación de email no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Verificación de email eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la verificación de email' },
      { status: 500 }
    );
  }
}
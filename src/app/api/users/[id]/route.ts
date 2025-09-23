import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/users/[id] - Obtener usuario por ID
export async function GET( request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el usuario' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Actualizar usuario por ID
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

    if (!body.phoneNumber || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Los campos phoneNumber, password y name son requeridos' },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(users)
      .set({
        phone: body.phone,
        password: body.password,
        name: body.name,
        email: body.email || null,
        zoneId: body.zoneId || null,
        role: body.role || null,
      })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Eliminar usuario por ID
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

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Usuario eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
}
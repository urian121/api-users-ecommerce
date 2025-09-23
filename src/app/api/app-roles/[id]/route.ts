import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appRoles } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/app-roles/[id] - Obtener app role por ID
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

    const appRole = await db.select().from(appRoles).where(eq(appRoles.id, id));
    
    if (appRole.length === 0) {
      return NextResponse.json(
        { error: 'App role no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(appRole[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el app role' },
      { status: 500 }
    );
  }
}

// PUT /api/app-roles/[id] - Actualizar app role por ID
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

    if (!body.idUser || !body.idApp || !body.role) {
      return NextResponse.json(
        { error: 'Los campos idUser, idApp y role son requeridos' },
        { status: 400 }
      );
    }

    const updatedAppRole = await db
      .update(appRoles)
      .set({
        idUser: body.idUser,
        idApp: body.idApp,
        role: body.role,
      })
      .where(eq(appRoles.id, id))
      .returning();

    if (updatedAppRole.length === 0) {
      return NextResponse.json(
        { error: 'App role no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAppRole[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el app role' },
      { status: 500 }
    );
  }
}

// DELETE /api/app-roles/[id] - Eliminar app role por ID
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

    const deletedAppRole = await db
      .delete(appRoles)
      .where(eq(appRoles.id, id))
      .returning();

    if (deletedAppRole.length === 0) {
      return NextResponse.json(
        { error: 'App role no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'App role eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el app role' },
      { status: 500 }
    );
  }
}
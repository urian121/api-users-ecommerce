import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apps } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/apps/[id] - Obtener app por ID
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

    const app = await db.select().from(apps).where(eq(apps.id, id));
    
    if (app.length === 0) {
      return NextResponse.json(
        { error: 'App no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(app[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la app' },
      { status: 500 }
    );
  }
}

// PUT /api/apps/[id] - Actualizar app por ID
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

    if (!body.name) {
      return NextResponse.json(
        { error: 'El campo name es requerido' },
        { status: 400 }
      );
    }

    const updatedApp = await db
      .update(apps)
      .set({ name: body.name })
      .where(eq(apps.id, id))
      .returning();

    if (updatedApp.length === 0) {
      return NextResponse.json(
        { error: 'App no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedApp[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la app' },
      { status: 500 }
    );
  }
}

// DELETE /api/apps/[id] - Eliminar app por ID
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

    const deletedApp = await db
      .delete(apps)
      .where(eq(apps.id, id))
      .returning();

    if (deletedApp.length === 0) {
      return NextResponse.json(
        { error: 'App no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'App eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la app' },
      { status: 500 }
    );
  }
}
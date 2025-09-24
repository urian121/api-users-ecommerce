import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appRoles, users, apps } from '@/db';
import { eq, and } from 'drizzle-orm';

// GET /api/app-roles/[id] - Obtener app role por ID con información completa
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

    const appRole = await db
      .select({
        id: appRoles.id,
        idUser: appRoles.idUser,
        idApp: appRoles.idApp,
        role: appRoles.role,
        userName: users.name,
        userPhone: users.phone,
        appName: apps.name,
      })
      .from(appRoles)
      .leftJoin(users, eq(appRoles.idUser, users.id))
      .leftJoin(apps, eq(appRoles.idApp, apps.id))
      .where(eq(appRoles.id, id));
    
    if (appRole.length === 0) {
      return NextResponse.json(
        { error: 'App role no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(appRole[0]);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
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

    // Validación de campos requeridos
    if (!body.idUser || !body.idApp || !body.role) {
      return NextResponse.json(
        { error: 'Los campos idUser, idApp y role son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el app role existe
    const existingAppRole = await db.select().from(appRoles).where(eq(appRoles.id, id));
    if (existingAppRole.length === 0) {
      return NextResponse.json(
        { error: 'App role no encontrado' },
        { status: 404 }
      );
    }

    // Validar que el usuario existe
    const userExists = await db.select().from(users).where(eq(users.id, body.idUser));
    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'El usuario especificado no existe' },
        { status: 404 }
      );
    }

    // Validar que la app existe
    const appExists = await db.select().from(apps).where(eq(apps.id, body.idApp));
    if (appExists.length === 0) {
      return NextResponse.json(
        { error: 'La app especificada no existe' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro rol para este usuario y app (excluyendo el actual)
    const duplicateRole = await db
      .select()
      .from(appRoles)
      .where(
        and(
          eq(appRoles.idUser, body.idUser),
          eq(appRoles.idApp, body.idApp),
          // Excluir el registro actual
          eq(appRoles.id, id)
        )
      );

    // Si encontramos un registro diferente al actual con la misma combinación usuario-app
    const conflictingRole = await db
      .select()
      .from(appRoles)
      .where(
        and(
          eq(appRoles.idUser, body.idUser),
          eq(appRoles.idApp, body.idApp)
        )
      );

    if (conflictingRole.length > 0 && conflictingRole[0].id !== id) {
      return NextResponse.json(
        { error: 'Ya existe un rol para este usuario y app' },
        { status: 409 }
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

    return NextResponse.json(updatedAppRole[0]);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
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
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json(
      { error: 'Error al eliminar el app role' },
      { status: 500 }
    );
  }
}
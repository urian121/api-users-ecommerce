import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appRoles, users, apps } from '@/db';
import { eq, and } from 'drizzle-orm';

// GET /api/app-roles - Obtener todos los app roles con información de usuario y app
export async function GET() {
  try {
    const allAppRoles = await db
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
      .leftJoin(apps, eq(appRoles.idApp, apps.id));

    return NextResponse.json(allAppRoles);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json(
      { error: 'Error al obtener los app roles' },
      { status: 500 }
    );
  }
}

// POST /api/app-roles - Crear nuevo app role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos
    if (!body.idUser || !body.idApp || !body.role) {
      return NextResponse.json(
        { error: 'Los campos idUser, idApp y role son requeridos' },
        { status: 400 }
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

    // Verificar si ya existe el rol para este usuario y app
    const existingRole = await db
      .select()
      .from(appRoles)
      .where(and(eq(appRoles.idUser, body.idUser), eq(appRoles.idApp, body.idApp)));

    if (existingRole.length > 0) {
      return NextResponse.json(
        { error: 'El usuario ya tiene un rol asignado para esta app' },
        { status: 409 }
      );
    }

    const newAppRole = await db.insert(appRoles).values({
      idUser: body.idUser,
      idApp: body.idApp,
      role: body.role,
    }).returning();

    return NextResponse.json(newAppRole[0], { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json(
      { error: 'Error al crear el app role' },
      { status: 500 }
    );
  }
}
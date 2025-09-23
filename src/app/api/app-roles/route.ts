import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appRoles } from '@/db';

// GET /api/app-roles - Obtener todos los app roles
export async function GET() {
  try {
    const allAppRoles = await db.select().from(appRoles);
    return NextResponse.json(allAppRoles);
  } catch (error) {
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

    const newAppRole = await db.insert(appRoles).values({
      idUser: body.idUser,
      idApp: body.idApp,
      role: body.role,
    }).returning();

    return NextResponse.json(newAppRole[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el app role' },
      { status: 500 }
    );
  }
}
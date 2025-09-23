import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apps } from '@/db';

// GET /api/apps - Obtener todas las apps
export async function GET() {
  try {
    const allApps = await db.select().from(apps);
    return NextResponse.json(allApps);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las apps' },
      { status: 500 }
    );
  }
}

// POST /api/apps - Crear nueva app
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos
    if (!body.name) {
      return NextResponse.json(
        { error: 'El campo name es requerido' },
        { status: 400 }
      );
    }

    const newApp = await db.insert(apps).values({
      name: body.name,
    }).returning();

    return NextResponse.json(newApp[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la app' },
      { status: 500 }
    );
  }
}
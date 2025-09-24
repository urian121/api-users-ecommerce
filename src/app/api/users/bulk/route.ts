import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { inArray } from 'drizzle-orm';

// 1. POST - Obtener múltiples usuarios por IDs
export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    // 2. Validar que se proporcionen IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un ID de usuario' },
        { status: 400 }
      );
    }

    // 3. Validar que todos los IDs sean números
    const validIds = ids.filter((id: unknown) => Number.isInteger(id) && Number(id) > 0);
    if (validIds.length !== ids.length) {
      return NextResponse.json(
        { error: 'Debe proporcionar IDs válidos' },
        { status: 400 }
      );
    }

    // 4. Buscar usuarios excluyendo passwords
    const foundUsers = await db.select({
      id: users.id,
      phone: users.phone,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(inArray(users.id, validIds));

    // 5. Identificar IDs no encontrados
    const foundIds = foundUsers.map(user => user.id);
    const notFoundIds = validIds.filter((id: number) => !foundIds.includes(id));

    // 6. Retornar respuesta con usuarios encontrados y no encontrados
    return NextResponse.json({
      users: foundUsers,
      notFound: notFoundIds,
      total: foundUsers.length
    });

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}
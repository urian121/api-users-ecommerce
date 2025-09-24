import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { sql } from 'drizzle-orm';

// 1. GET - Obtener usuarios paginados
export async function GET( request: NextRequest, { params }: { params: { page: string; limit: string } }) {
  try {
    const page = parseInt(params.page);
    const limit = parseInt(params.limit);
    
    // 2. Validar parámetros de paginación
    if (isNaN(page) || page < 0) {
      return NextResponse.json(
        { error: 'El parámetro page debe ser un número >= 0' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'El parámetro limit debe ser un número entre 1 y 100' },
        { status: 400 }
      );
    }

    // 3. Calcular offset para paginación
    const offset = page * limit;

    // 4. Seleccionar campos específicos (excluyendo password)
    const baseSelect = {
      id: users.id,
      phone: users.phone,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    };

    // 5. Ejecutar queries en paralelo para optimizar rendimiento
    const [paginatedUsers, totalCountResult] = await Promise.all([
      db.select(baseSelect).from(users).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(users)
    ]);

    const totalCount = Number(totalCountResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // 6. Construir respuesta paginada
    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        currentPage: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0
      }
    });

  } catch (error) {
    console.error('Error fetching paginated users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios paginados' },
      { status: 500 }
    );
  }
}
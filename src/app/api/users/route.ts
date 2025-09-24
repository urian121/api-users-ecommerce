import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

// 1. GET - Obtener lista de usuarios
export async function GET() {
  try {
    const allUsers = await db.select({
      id: users.id,
      phone: users.phone,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);
    
    return NextResponse.json(allUsers);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// 2. POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const { phone, password, name, email, role } = await request.json();
    
    // 3. Validación de campos requeridos según schema
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Los campos phone y password son obligatorios' },
        { status: 400 }
      );
    }

    // 4. Validar formato de teléfono básico
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 422 }
      );
    }

    // 5. Verificar si el teléfono ya existe
    const existingUser = await db.select().from(users).where(eq(users.phone, phone));
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'El teléfono ya está registrado' },
        { status: 400 }
      );
    }

    // 6. Crear nuevo usuario
    const newUser = await db.insert(users).values({
      phone,
      password,
      name: name || null,
      email: email || null,
      role: role || null,
    }).returning();
    
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
  }
}
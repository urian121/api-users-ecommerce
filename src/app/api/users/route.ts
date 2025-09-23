import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de campos requeridos según el schema
    if (!body.phoneNumber || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Los campos phoneNumber, password y name son requeridos' },
        { status: 400 }
      );
    }

    const newUser = await db.insert(users).values({
      phoneNumber: body.phoneNumber,
      password: body.password,
      name: body.name,
      lastName: body.lastName || null,
      email: body.email || null,
      idNumber: body.idNumber || null,
      idType: body.idType || null,
    }).returning();
    
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
}
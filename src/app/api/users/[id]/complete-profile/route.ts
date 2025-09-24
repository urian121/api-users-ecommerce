import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

// Simulación de rate limiting en memoria
const emailRateLimit = new Map<number, { count: number, lastSent: number, dailyCount: number, dailyReset: number }>();

// 1. POST - Completar perfil de usuario
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { name, email } = await request.json();
    
    // 2. Validar ID numérico
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // 3. Validar campos requeridos
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Los campos name y email son obligatorios' },
        { status: 400 }
      );
    }

    // 4. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { 
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // 5. Verificar si el usuario existe
    const existingUser = await db.select().from(users).where(eq(users.id, id));
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 6. Implementar rate limiting para email
    const now = Date.now();
    const userRateLimit = emailRateLimit.get(id) || { 
      count: 0, 
      lastSent: 0, 
      dailyCount: 0, 
      dailyReset: now + 24 * 60 * 60 * 1000 
    };

    // Reset diario
    if (now > userRateLimit.dailyReset) {
      userRateLimit.dailyCount = 0;
      userRateLimit.dailyReset = now + 24 * 60 * 60 * 1000;
    }

    // Verificar límite de 1 minuto
    if (now - userRateLimit.lastSent < 60000) {
      return NextResponse.json(
        { 
          error: 'Debe esperar 1 minuto antes de enviar otro código',
          retryAfter: Math.ceil((60000 - (now - userRateLimit.lastSent)) / 1000)
        },
        { status: 429 }
      );
    }

    // Verificar límite diario de 10 códigos
    if (userRateLimit.dailyCount >= 10) {
      return NextResponse.json(
        { 
          error: 'Límite diario de códigos alcanzado (10 por día)',
          retryAfter: Math.ceil((userRateLimit.dailyReset - now) / 1000)
        },
        { status: 429 }
      );
    }

    // 7. Actualizar perfil del usuario
    const updatedUser = await db.update(users)
      .set({
        name: name,
        email: email,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        phone: users.phone,
        name: users.name,
        email: users.email,
        role: users.role,
        updatedAt: users.updatedAt
      });

    // 8. Actualizar rate limiting
    userRateLimit.lastSent = now;
    userRateLimit.dailyCount += 1;
    emailRateLimit.set(id, userRateLimit);

    // 9. Simular envío de código de verificación por email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Código de verificación enviado a ${email}: ${verificationCode}`);

    return NextResponse.json({
      message: 'Perfil completado exitosamente',
      user: updatedUser[0],
      emailVerificationSent: true,
      verificationCode: verificationCode // Solo para desarrollo, remover en producción
    });

  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json(
      { error: 'Error al completar el perfil' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerification, users, createUserAttempt } from '@/drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { VerifyCodeRequest, VerifyCodeResponse, PhoneVerificationError } from '@/types/phone-verification';

// POST /api/phone-verification/verify - Verificar código SMS
export async function POST(request: NextRequest): Promise<NextResponse<VerifyCodeResponse | PhoneVerificationError>> {
  try {
    const { ipId, code }: VerifyCodeRequest = await request.json();

    if (!ipId || !code) {
      return NextResponse.json({ error: 'ipId y code son requeridos' }, { status: 400 });
    }

    // Validar formato del código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'El código debe ser de 6 dígitos numéricos' }, { status: 400 });
    }

    const now = new Date();

    // Buscar verificación activa
    const verification = await db.select().from(phoneVerification)
      .where(and(
        eq(phoneVerification.ipId, ipId),
        eq(phoneVerification.code, code),
        gte(phoneVerification.validUntil, now),
        eq(phoneVerification.verified, false)
      ));

    if (verification.length === 0) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
    }

    // Obtener datos del intento de usuario
    const userAttempt = await db.select().from(createUserAttempt).where(eq(createUserAttempt.id, ipId));
    if (userAttempt.length === 0) {
      return NextResponse.json({ error: 'Intento de usuario no encontrado' }, { status: 404 });
    }

    const attempt = userAttempt[0];

    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.phone, attempt.phoneNumber));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 409 });
    }

    // Marcar verificación como completada
    await db.update(phoneVerification)
      .set({ verified: true })
      .where(eq(phoneVerification.ipId, ipId));

    // Crear usuario en tabla definitiva
    await db.insert(users).values({
      phone: attempt.phoneNumber,
      password: attempt.password, // Ya está hasheado
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Código verificado y usuario creado exitosamente',
      verified: true,
    }, { status: 201 });

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al verificar código' }, { status: 500 });
  }
}
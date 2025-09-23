import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerification, users, createUserAttempt } from '@/drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { VerifyCodeRequest, VerifyCodeResponse, PhoneVerificationError } from '@/types/phone-verification';

/**
 * POST /api/phone-verification/verify - Verificar código SMS
 * Valida código de 6 dígitos enviado por SMS
 * Verifica que no esté expirado (5 min máximo)
 * Crea usuario definitivo si la verificación es exitosa en la tabla users
 * Marca la verificación como completada
 */
export async function POST(request: NextRequest): Promise<NextResponse<VerifyCodeResponse | PhoneVerificationError>> {
  try {
    // 1. Validar datos de entrada
    const { ipId, code }: VerifyCodeRequest = await request.json();

    if (!ipId || !code) {
      return NextResponse.json({ error: 'ipId y code son requeridos' }, { status: 400 });
    }

    // 2. Validar formato del código (debe ser 6 dígitos numéricos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'El código debe ser de 6 dígitos numéricos' }, { status: 400 });
    }

    // 3. Configurar tiempo actual para validaciones de expiración
    const now = new Date();

    // 4. Buscar verificación activa que coincida con los criterios
    const verification = await db.select().from(phoneVerification)
      .where(and(
        eq(phoneVerification.ipId, ipId), // Mismo intento de usuario
        eq(phoneVerification.code, code), // Código correcto
        gte(phoneVerification.validUntil, now), // No expirado (5 min)
        eq(phoneVerification.verified, false) // Aún no verificado
      ));
    
    // 5. Verificar si se encontró alguna verificación activa
    if (verification.length === 0) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
    }

    // 6. Obtener datos del intento de usuario original
    const userAttempt = await db.select().from(createUserAttempt).where(eq(createUserAttempt.id, ipId));
    if (userAttempt.length === 0) {
      return NextResponse.json({ error: 'Intento de usuario no encontrado' }, { status: 404 });
    }
    
    // 7. Obtener datos del intento de usuario original
    const attempt = userAttempt[0];

    // 8. Verificar que el usuario no exista ya en la tabla definitiva
    const existingUser = await db.select().from(users).where(eq(users.phone, attempt.phoneNumber));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 409 });
    }

    // 9. Marcar verificación como completada (evita reutilización del código)
    await db.update(phoneVerification)
      .set({ verified: true })
      .where(eq(phoneVerification.ipId, ipId));

    // 10. Crear usuario definitivo en tabla 'users'
    await db.insert(users).values({
      phone: attempt.phoneNumber,
      password: attempt.password, // Ya está hasheado desde create-user-attempt
      createdAt: now,
      updatedAt: now,
    });

    // 11. Retornar respuesta exitosa
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
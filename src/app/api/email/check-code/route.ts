import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerification, users } from '@/drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { VerifyEmailCodeRequest, VerifyEmailCodeResponse, EmailVerificationError } from '@/types/email-verification';

/**
 * POST /api/email-verify-check-code - Verificar código de email
 * Valida código de 6 dígitos enviado por email
 * Verifica que no esté expirado (5 min máximo)
 * Marca la verificación como completada
 * No crea usuario (solo verifica email existente)
 */
export async function POST(request: NextRequest): Promise<NextResponse<VerifyEmailCodeResponse | EmailVerificationError>> {
  try {
    // 1. Validar datos de entrada
    const { userId, code }: VerifyEmailCodeRequest = await request.json();

    if (!userId || !code) {
      return NextResponse.json({ error: 'userId y code son requeridos' }, { status: 400 });
    }

    // 2. Validar formato del código (debe ser 6 dígitos numéricos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'El código debe ser de 6 dígitos numéricos' }, { status: 400 });
    }

    // 3. Verificar que el usuario existe
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 4. Configurar tiempo actual para validaciones de expiración
    const now = new Date();

    // 5. Buscar verificación activa que coincida con los criterios
    const verification = await db.select().from(emailVerification)
      .where(and(
        eq(emailVerification.userId, userId), // Mismo usuario
        eq(emailVerification.code, code), // Código correcto
        gte(emailVerification.validUntil, now), // No expirado (5 min)
        eq(emailVerification.verified, false) // Aún no verificado
      ));
    
    // 6. Verificar si se encontró alguna verificación activa
    if (verification.length === 0) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
    }

    // 7. Marcar verificación como completada (evita reutilización del código)
    await db.update(emailVerification)
      .set({ verified: true })
      .where(eq(emailVerification.userId, userId));

    // 8. Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
      verified: true,
    }, { status: 200 });

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al verificar código' }, { status: 500 });
  }
}
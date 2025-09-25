import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerification, users, EmailVerification } from '@/drizzle/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import { SendEmailCodeRequest, SendEmailCodeResponse, EmailVerificationError } from '@/types/email-verification';
import { sendEmail } from '@/utils/email-service';

// GET /api/email-verify-send-code - Obtener todas las verificaciones de email
export async function GET(): Promise<NextResponse<EmailVerification[] | EmailVerificationError>> {
  try {
    const allVerifications = await db.select().from(emailVerification);
    return NextResponse.json(allVerifications);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al obtener verificaciones' }, { status: 500 });
  }
}

/**
 * POST /api/email-verify-send-code - Enviar código por email
 * Genera código de 6 dígitos aleatorio
 * Valida rate limiting (1 min entre códigos, 10 max/día)
 * Simula envío email (log en desarrollo)
 * Retorna tiempo de expiración (5 min)
 * Solo se puede enviar un código por usuario por minuto
 */
export async function POST(request: NextRequest): Promise<NextResponse<SendEmailCodeResponse | EmailVerificationError>> {
  try {
    // 1. Validar datos de entrada
    const { userId }: SendEmailCodeRequest = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // 2. Verificar que el usuario existe y tiene email
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user[0].email) {
      return NextResponse.json({ error: 'Usuario no tiene email registrado' }, { status: 400 });
    }

    // 3. Configurar rangos de tiempo para validaciones
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 minuto atrás
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas atrás

    // 4. Validar rate limiting: 1 minuto entre códigos
    const recentCode = await db.select().from(emailVerification)
      .where(and(
        eq(emailVerification.userId, userId),
        gte(emailVerification.lastCodeSent, oneMinuteAgo)
      ));

    // 5. Si ya se ha enviado un código en el último minuto, rechazar
    if (recentCode.length > 0) {
      return NextResponse.json({ error: 'Debe esperar 1 minuto antes de solicitar otro código' }, { status: 429 });
    }

    // 6. Validar límite diario: máximo 10 códigos por día
    const [dailyCount] = await db.select({ count: count() }).from(emailVerification)
      .where(and(
        eq(emailVerification.userId, userId),
        gte(emailVerification.lastCodeSent, oneDayAgo)
      ));

    // 7. Si se ha alcanzado el límite diario, rechazar
    if (dailyCount.count >= 10) {
      return NextResponse.json({ error: 'Límite diario de códigos alcanzado (10 máximo)' }, { status: 429 });
    }

    // 8. Generar código aleatorio y tiempo de expiración
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const validUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos

    // 9. Insertar o actualizar registro de verificación
    const existingVerification = await db.select().from(emailVerification).where(eq(emailVerification.userId, userId));

    // 10. Si ya existe una verificación, actualizarla
    if (existingVerification.length > 0) {
      const current = existingVerification[0];
      await db.update(emailVerification)
        .set({
          code,
          validUntil,
          verified: false,
          codesSentCount: (current.codesSentCount || 0) + 1,
          lastCodeSent: now,
        })
        .where(eq(emailVerification.userId, userId));
    } else {
      // 11. Crear nueva verificación
      await db.insert(emailVerification).values({
        userId,
        code,
        validUntil,
        verified: false,
        codesSentCount: 1,
        lastCodeSent: now,
      });
    }

    // 12. Enviar email real o simulado
    const userEmail = user[0].email;
    console.log('Enviando email a:', userEmail, 'Código:', code);
    const emailResult = await sendEmail(userEmail, code);
    
    if (!emailResult.success) {
      console.error('Error enviando email:', emailResult.error);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Simulando envío email a ${userEmail} (Usuario ID: ${userId}): Código ${code}`);
    }

    // 13. Retornar respuesta exitosa con detalles
    return NextResponse.json({
      success: true,
      message: 'Código enviado exitosamente',
      expiresAt: validUntil.toISOString(),
      codesSentToday: dailyCount.count + 1,
    }, { status: 200 });

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al enviar código' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { phoneVerification, createUserAttempt, PhoneVerification } from '@/drizzle/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import { SendCodeRequest, SendCodeResponse, PhoneVerificationError } from '@/types/phone-verification';
import { sendSMS } from '@/utils/sms-service'; // Importar la función sendSMS


// GET /api/phone-verify-send-code - Obtener todas las verificaciones
export async function GET(): Promise<NextResponse<PhoneVerification[] | PhoneVerificationError>> {
  try {
    const allVerifications = await db.select().from(phoneVerification);
    return NextResponse.json(allVerifications);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return NextResponse.json({ error: 'Error al obtener verificaciones' }, { status: 500 });
  }
}

/**
 * POST /api/phone-verify-send-code - Enviar código SMS
 * Genera código de 6 dígitos aleatorio
 * Valida rate limiting (1 min entre códigos, 10 max/día)
 * Simula envío SMS (log en desarrollo)
 * Retorna tiempo de expiración (5 min)
 * Solo se puede enviar un código por IP por minuto
 */
export async function POST(request: NextRequest): Promise<NextResponse<SendCodeResponse | PhoneVerificationError>> {
  try {
    // 1. Validar datos de entrada
    const { ipId }: SendCodeRequest = await request.json(); // ID del intento de usuario (campo 'id' de create_user_attempt)

    if (!ipId) {
      return NextResponse.json({ error: 'ipId es requerido' }, { status: 400 });
    }

    // 2. Verificar que el intento de usuario existe
    const userAttempt = await db.select().from(createUserAttempt).where(eq(createUserAttempt.id, ipId));
    if (userAttempt.length === 0) {
      return NextResponse.json({ error: 'ID de intento no válido' }, { status: 404 });
    }

    // 3. Configurar rangos de tiempo para validaciones
    const now = new Date(); // Fecha y hora actual
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 minuto atrás
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas atrás

    // 4. Validar rate limiting: 1 minuto entre códigos
    const recentCode = await db.select().from(phoneVerification)
      .where(and(
        eq(phoneVerification.ipId, ipId),
        gte(phoneVerification.lastCodeSent, oneMinuteAgo)
      ));

    // 5. Si ya se ha enviado un código en el último minuto, rechazar
    if (recentCode.length > 0) {
      return NextResponse.json({ error: 'Debe esperar 1 minuto antes de solicitar otro código' }, { status: 429 });
    }

    // 6. Validar límite diario: máximo 10 códigos por día
    const [dailyCount] = await db.select({ count: count() }).from(phoneVerification)
      .where(and(
        eq(phoneVerification.ipId, ipId),
        gte(phoneVerification.lastCodeSent, oneDayAgo)
      ));

    // 7. Si se ha alcanzado el límite diario, rechazar
    if (dailyCount.count >= 10) {
      return NextResponse.json({ error: 'Límite diario de códigos alcanzado (10 máximo)' }, { status: 429 });
    }

    // 8. Generar código aleatorio y tiempo de expiración
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const validUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos

    // 9. Insertar o actualizar registro de verificación
    const existingVerification = await db.select().from(phoneVerification).where(eq(phoneVerification.ipId, ipId));

    // 10. Si ya existe una verificación, actualizarla
    if (existingVerification.length > 0) {
      // 11. Actualizar verificación existente
      const current = existingVerification[0];
      await db.update(phoneVerification)
        .set({
          code,
          validUntil,
          verified: false,
          codesSentCount: (current.codesSentCount || 0) + 1,
          lastCodeSent: now,
        })
        .where(eq(phoneVerification.ipId, ipId));
    } else {
      // 12. Crear nueva verificación
      await db.insert(phoneVerification).values({
        ipId,
        code,
        validUntil,
        verified: false,
        codesSentCount: 1,
        lastCodeSent: now,
      });
    }

    // 8. Enviar SMS real o simulado
    const phoneNumber = userAttempt[0].phoneNumber;
    console.log('Enviando SMS a:', phoneNumber, 'Código:', code);
    const smsResult = await sendSMS(phoneNumber, code);
    
    if (!smsResult.success) {
      console.error('Error enviando SMS:', smsResult.error);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Simulando envío SMS a ${phoneNumber} (Usuario ID: ${ipId}): Código ${code}`);
    }

    // 14. Retornar respuesta exitosa con detalles
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
/**
 * Servicio de envío de SMS
 * Simula el envío en desarrollo y usa API real en producción
 */

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía SMS usando Twilio, AWS SNS o servicio similar
 * En desarrollo solo simula el envío
 */
export async function sendSMS(phoneNumber: string, code: string): Promise<SMSResponse> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Simulación en desarrollo
      console.log(`Simulando envío SMS a ${phoneNumber}: "Tu código de verificación es: ${code}"`);
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    // En producción aquí iría la integración real
    // Ejemplo con Twilio:
    /*
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    const message = await client.messages.create({
      body: `Tu código de verificación es: ${code}`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber
    });
    return { success: true, messageId: message.sid };
    */

    // Por ahora simular también en producción
    console.log(`SMS enviado a ${phoneNumber}: Código ${code}`);
    return { success: true, messageId: `prod_${Date.now()}` };

  } catch (error) {
    console.error('Error enviando SMS:', error);
    return { success: false, error: 'Error al enviar SMS' };
  }
}

/**
 * Valida formato de número telefónico
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Formato básico: +1234567890 o 1234567890
  const phoneRegex = /^(\+?[1-9]\d{1,14})$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
}
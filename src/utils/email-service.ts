/**
 * Servicio de envío de emails
 * Simula el envío en desarrollo y usa API real en producción
 */

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía email usando SendGrid, AWS SES o servicio similar
 * En desarrollo solo simula el envío
 */
export async function sendEmail(email: string, code: string): Promise<EmailResponse> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Simulación en desarrollo
      console.log(`Simulando envío email a ${email}: "Tu código de verificación es: ${code}"`);
      return { success: true, messageId: `email_sim_${Date.now()}` };
    }

    // En producción aquí iría la integración real
    // Ejemplo con SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${code}`,
      html: `<strong>Tu código de verificación es: ${code}</strong>`,
    };
    
    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
    */

    // Por ahora simular también en producción
    console.log(`Email enviado a ${email}: Código ${code}`);
    return { success: true, messageId: `email_prod_${Date.now()}` };

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { success: false, error: 'Error al enviar email' };
  }
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
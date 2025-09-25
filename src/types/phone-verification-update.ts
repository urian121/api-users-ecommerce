// Tipos para actualización de teléfono - envío de código
export interface SendPhoneUpdateCodeRequest {
  userId: number; // ID del usuario
  phoneNumber: string; // Nuevo número de teléfono
}

export interface SendPhoneUpdateCodeResponse {
  success: true;
  message: string;
  expiresAt: string; // ISO timestamp
  codesSentToday: number;
}

// Tipos para verificación de código de actualización de teléfono
export interface VerifyPhoneUpdateCodeRequest {
  userId: number;
  code: string;
}

export interface VerifyPhoneUpdateCodeResponse {
  success: true;
  message: string;
  verified: boolean;
  phoneNumber: string; // Nuevo teléfono verificado
}

// Tipos de error
export interface PhoneVerificationUpdateError {
  error: string;
}
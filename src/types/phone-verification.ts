// Tipos para envío de código SMS
export interface SendCodeRequest {
  ipId: number; // ID del intento de usuario
}

export interface SendCodeResponse {
  success: true;
  message: string;
  expiresAt: string; // ISO timestamp
  codesSentToday: number;
}

// Tipos para verificación de código
export interface VerifyCodeRequest {
  ipId: number;
  code: string;
}

export interface VerifyCodeResponse {
  success: true;
  message: string;
  verified: boolean;
}

// Tipos de error
export interface PhoneVerificationError {
  error: string;
}
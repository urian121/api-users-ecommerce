import { NextRequest } from 'next/server';

/**
 * Obtiene la IP real del cliente desde los headers HTTP
 * Maneja proxies, CDNs y load balancers
 * Convierte IPv6 localhost (::1) a IPv4 (127.0.0.1)
 */
export function getClientIp(request: NextRequest): string {
  let ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           request.headers.get('x-client-ip') ||
           request.headers.get('remote-addr') ||
           'unknown';

  // Convertir IPv6 localhost a IPv4
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  // Si es desarrollo y no hay IP real, usar una IP de ejemplo
  if (process.env.NODE_ENV === 'development' && (ip === 'unknown' || ip === '127.0.0.1')) {
    ip = '192.168.1.100'; // IP de ejemplo para desarrollo
  }

  return ip;
}
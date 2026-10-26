import { decodeJwtPayload } from '../crypto/decode-jwt-payload';

export function isServerOnlySupabaseKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  return decodeJwtPayload(key)?.role === 'service_role';
}

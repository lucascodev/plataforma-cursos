import type { JwtPayload } from './jwt-payload.type';

// Reads claims without verifying the signature. Use it only for routing decisions (expiry, user id in filters);
// Supabase verifies every token it receives, so a forged token never gets past the database.
export function decodeJwtPayload(token: string): JwtPayload | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload: unknown = JSON.parse(json);
    return payload && typeof payload === 'object' ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
}

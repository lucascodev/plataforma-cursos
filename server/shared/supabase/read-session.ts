import type { SupabaseSession } from './supabase-session.type';

export function readSession(body: unknown): SupabaseSession | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = record;
  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') return null;
  return { accessToken, refreshToken, expiresInSeconds: typeof expiresIn === 'number' ? expiresIn : 3600 };
}

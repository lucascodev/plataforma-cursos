import type { ServerConfig } from '../env/server-config.type';
import { readSession } from './read-session';
import { SupabaseRequestError } from './supabase-request-error';
import type { SupabaseSession } from './supabase-session.type';
import type { SupabaseUser } from './supabase-user.type';

export class SupabaseAuthClient {
  constructor(
    private readonly config: ServerConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  authorizeUrl(redirectTo: string, codeChallenge: string): string {
    const url = new URL('/auth/v1/authorize', this.config.supabaseUrl);
    url.searchParams.set('provider', 'github');
    url.searchParams.set('redirect_to', redirectTo);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 's256');
    return url.toString();
  }

  async exchangeCode(authCode: string, codeVerifier: string): Promise<SupabaseSession> {
    return this.requestSession('pkce', { auth_code: authCode, code_verifier: codeVerifier });
  }

  async refresh(refreshToken: string): Promise<SupabaseSession> {
    return this.requestSession('refresh_token', { refresh_token: refreshToken });
  }

  async getUser(accessToken: string): Promise<SupabaseUser | null> {
    const response = await this.fetcher(`${this.config.supabaseUrl}/auth/v1/user`, {
      headers: { apikey: this.config.publishableKey, Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new SupabaseRequestError(response.status, 'get user');
    const user: unknown = await response.json();
    return user && typeof user === 'object' && typeof (user as SupabaseUser).id === 'string' ? (user as SupabaseUser) : null;
  }

  async signOut(accessToken: string): Promise<void> {
    const response = await this.fetcher(`${this.config.supabaseUrl}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: { apikey: this.config.publishableKey, Authorization: `Bearer ${accessToken}` },
    });
    // 401 and 404 mean the session is already gone, which is what logging out wants.
    if (!response.ok && response.status !== 401 && response.status !== 404) throw new SupabaseRequestError(response.status, 'logout');
  }

  private async requestSession(grantType: 'pkce' | 'refresh_token', body: Record<string, string>): Promise<SupabaseSession> {
    const response = await this.fetcher(`${this.config.supabaseUrl}/auth/v1/token?grant_type=${grantType}`, {
      method: 'POST',
      headers: { apikey: this.config.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new SupabaseRequestError(response.status, grantType);
    const session = readSession(await response.json());
    if (!session) throw new SupabaseRequestError(502, grantType);
    return session;
  }
}

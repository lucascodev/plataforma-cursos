import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { AuthGateway } from '../../application/ports/auth-gateway.interface';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import { AUTH_API_PATHS } from '../constants/auth-api-paths';
import { InvalidAuthResponseError } from '../errors/invalid-auth-response.error';
import { currentUserResponseSchema } from '../schemas/current-user-response.schema';

// The session lives in HttpOnly cookies set by /api. This code never sees a token; it only asks who is signed in.
export class HttpAuthGateway implements AuthGateway {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly navigate: (url: string) => void,
  ) {}

  async getCurrentUser(): Promise<AuthUser | null> {
    let body: unknown;
    try {
      body = await this.httpClient.request({ path: AUTH_API_PATHS.currentUser });
    } catch (error) {
      if (error instanceof SessionExpiredError) return null;
      throw error;
    }
    const parsed = currentUserResponseSchema.safeParse(body);
    if (!parsed.success) throw new InvalidAuthResponseError();
    return parsed.data.user;
  }

  signInWithGitHub(returnPath: string): void {
    this.navigate(`${AUTH_API_PATHS.login}?${new URLSearchParams({ returnTo: returnPath }).toString()}`);
  }

  async signOut(): Promise<void> {
    await this.httpClient.request({ method: 'POST', path: AUTH_API_PATHS.logout });
  }

  async signOutEverywhere(): Promise<void> {
    await this.httpClient.request({ method: 'POST', path: AUTH_API_PATHS.logoutEverywhere });
  }

  async deleteAccount(): Promise<void> {
    await this.httpClient.request({ method: 'DELETE', path: AUTH_API_PATHS.currentUser });
  }
}

import type { AuthUser } from '../../domain/entities/auth-user.entity';

export interface AuthSession {
  readonly status: 'loading' | 'signed-out' | 'signed-in';
  readonly user: AuthUser | null;
  readonly errorMessage: string | null;
  signIn(returnPath: string): void;
  signOut(): Promise<void>;
  reportSessionExpired(): void;
}

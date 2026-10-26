import type { AuthUser } from '../../domain/entities/auth-user.entity';

export interface AuthGateway {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithGitHub(returnPath: string): void;
  signOut(): Promise<void>;
}

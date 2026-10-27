import type { AuthUser } from '../../domain/entities/auth-user.entity';

export interface AuthGateway {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithGitHub(returnPath: string): void;
  signOut(): Promise<void>;
  /** Ends the sessions on every device, this one included. */
  signOutEverywhere(): Promise<void>;
  /** Deletes the account and everything tied to it. The session ends with it. */
  deleteAccount(): Promise<void>;
}

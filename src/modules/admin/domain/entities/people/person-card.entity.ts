import type { AdminRole } from '../../types/admin-role.type';

export interface PersonCard {
  readonly id: string;
  readonly handle: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly role: AdminRole;
}

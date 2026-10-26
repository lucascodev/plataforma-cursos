import type { AuditAction } from '../../types/audit-action.type';
import type { PersonCard } from '../people/person-card.entity';

export interface AuditEntry {
  readonly id: number;
  readonly at: string;
  readonly action: AuditAction;
  readonly targetType: 'proposal' | 'profile' | 'course';
  readonly targetId: string;
  readonly targetLabel: string | null;
  readonly data: Readonly<Record<string, unknown>>;
  readonly actor: PersonCard | null;
}

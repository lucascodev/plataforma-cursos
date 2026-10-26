import type { AuditEntry } from './audit-entry.entity';

export interface AuditPage {
  readonly items: readonly AuditEntry[];
  readonly nextBefore: number | null;
}

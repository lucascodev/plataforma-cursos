import type { AuditEntry } from '../../domain/entities/audit/audit-entry.entity';
import type { AdminRole } from '../../domain/types/admin-role.type';
import { ROLE_LABELS } from './describe-role';

const roleLabel = (value: unknown) => (typeof value === 'string' && value in ROLE_LABELS ? ROLE_LABELS[value as AdminRole] : '?');

// Sentences in Portuguese for the history. The target label (proposal title, handle or slug) is read at display time.
export function describeAuditEntry(entry: AuditEntry): string {
  const target = entry.targetLabel ?? entry.targetId;
  switch (entry.action) {
    case 'proposal.submitted':
      return `enviou a proposta "${target}"`;
    case 'proposal.approved':
      return `aprovou a proposta "${target}" e criou o curso ${String(entry.data.courseSlug ?? '')}`.trim();
    case 'proposal.changes_requested':
      return `pediu ajustes na proposta "${target}"`;
    case 'proposal.refused':
      return `recusou a proposta "${target}"`;
    case 'proposal.withdrawn':
      return `retirou a proposta "${target}"`;
    case 'role.changed':
      return `mudou o papel de @${target} de ${roleLabel(entry.data.from)} para ${roleLabel(entry.data.to)}`;
    case 'course.owner_changed':
      return `trocou a pessoa dona do curso ${target}`;
    case 'course.listed':
      return `colocou o curso ${target} de volta no catálogo`;
    case 'course.unlisted':
      return `tirou o curso ${target} do catálogo`;
    case 'course.deleted':
      return `apagou o curso ${target}`;
  }
}

import type { AuditEntry } from '../../domain/entities/audit/audit-entry.entity';
import type { AdminRole } from '../../domain/types/admin-role.type';
import { ROLE_LABELS } from './describe-role';

const roleLabel = (value: unknown) => (typeof value === 'string' && value in ROLE_LABELS ? ROLE_LABELS[value as AdminRole] : '?');

const semver = (entry: AuditEntry) => (typeof entry.data.semver === 'string' ? ` ${entry.data.semver}` : '');

// Sentences in Portuguese for the history. The target label (proposal title, handle or course title) is read at display
// time; a deleted account has no label left, on purpose.
export function describeAuditEntry(entry: AuditEntry): string {
  const target = entry.targetLabel ?? entry.targetId;
  const person = entry.targetLabel ? `@${entry.targetLabel}` : 'uma conta excluída';
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
    case 'version.submitted':
      return `enviou ${target}${semver(entry)} para revisão`;
    case 'version.withdrawn':
      return `retirou ${target}${semver(entry)} da revisão`;
    case 'version.changes_requested':
      return `pediu ajustes em ${target}${semver(entry)}`;
    case 'version.published':
      return `publicou ${target}${semver(entry)}`;
    case 'version.restored':
      return `restaurou uma versão antiga de ${target} como rascunho`;
    case 'account.deleted':
      return 'excluiu uma conta';
    case 'account.sessions_ended':
      return `encerrou as sessões de ${person}`;
    case 'account.blocked':
      return `bloqueou ${person}`;
    case 'account.unblocked':
      return `desbloqueou ${person}`;
    case 'profile.reported':
      return `avisou sobre o perfil ${person}`;
    case 'report.resolved':
      return `resolveu um aviso sobre ${person}`;
    case 'report.dismissed':
      return `arquivou um aviso sobre ${person}`;
  }
}

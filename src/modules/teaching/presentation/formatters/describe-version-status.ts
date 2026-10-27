import type { VersionStatus } from '../../domain/types/version-status.type';

type BadgeTone = 'neutral' | 'accent' | 'warning' | 'danger';

const STATUS: Readonly<Record<VersionStatus, { readonly label: string; readonly tone: BadgeTone }>> = {
  draft: { label: 'Rascunho', tone: 'neutral' },
  in_review: { label: 'Em revisão', tone: 'accent' },
  changes_requested: { label: 'Ajustes pedidos', tone: 'warning' },
  published: { label: 'Publicado', tone: 'accent' },
  superseded: { label: 'Versão anterior', tone: 'neutral' },
};

export function describeVersionStatus(status: VersionStatus): { readonly label: string; readonly tone: BadgeTone } {
  return STATUS[status];
}

import type { UnlistReason } from '../../domain/types/unlist-reason.type';

export const UNLIST_REASON_LABELS: Readonly<Record<UnlistReason, string>> = {
  outdated: 'Conteúdo desatualizado',
  quality: 'Problema de qualidade',
  'teacher-request': 'Pedido do professor',
  reported: 'Avisos de quem estuda',
  other: 'Outro motivo',
};

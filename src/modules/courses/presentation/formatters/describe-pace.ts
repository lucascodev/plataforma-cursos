import type { PaceSummary } from '../../domain/entities/summary/pace-summary.entity';

export function describePace(pace: PaceSummary): string {
  if (pace.status === 'on-track') return 'No ritmo do plano';
  const items = `${pace.items} ${pace.items === 1 ? 'item' : 'itens'}`;
  return pace.status === 'ahead' ? `${items} à frente do plano` : `${items} atrás do plano`;
}

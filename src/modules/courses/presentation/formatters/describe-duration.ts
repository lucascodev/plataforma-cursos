import { pluralize } from '@/shared/utils/text/pluralize';

export function describeDuration(months: number): string {
  return `≈ ${pluralize(Math.round(months), 'mês', 'meses')}`;
}

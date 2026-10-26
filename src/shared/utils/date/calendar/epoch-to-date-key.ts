import type { DateKey } from '@/shared/domain/types/date-key.type';

export function epochToDateKey(epoch: number): DateKey {
  const date = new Date(epoch);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

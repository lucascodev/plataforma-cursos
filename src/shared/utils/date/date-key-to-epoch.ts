import type { DateKey } from '@/shared/domain/types/date-key.type';

export function dateKeyToEpoch(key: DateKey): number {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

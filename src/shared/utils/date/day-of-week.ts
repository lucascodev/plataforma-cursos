import type { DateKey } from '@/shared/domain/types/date-key.type';
import { dateKeyToEpoch } from './date-key-to-epoch';

export function dayOfWeek(key: DateKey): number {
  return new Date(dateKeyToEpoch(key)).getUTCDay();
}

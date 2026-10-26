import type { DateKey } from '@/shared/domain/types/date-key.type';
import { dateKeyToEpoch } from './date-key-to-epoch';
import { epochToDateKey } from './epoch-to-date-key';
import { MILLISECONDS_PER_DAY } from './milliseconds-per-day';

export function addDays(key: DateKey, days: number): DateKey {
  return epochToDateKey(dateKeyToEpoch(key) + days * MILLISECONDS_PER_DAY);
}

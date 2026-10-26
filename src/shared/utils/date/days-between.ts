import type { DateKey } from '@/shared/domain/types/date-key.type';
import { dateKeyToEpoch } from './date-key-to-epoch';
import { MILLISECONDS_PER_DAY } from './milliseconds-per-day';

export function daysBetween(from: DateKey, to: DateKey): number {
  return Math.round((dateKeyToEpoch(to) - dateKeyToEpoch(from)) / MILLISECONDS_PER_DAY);
}

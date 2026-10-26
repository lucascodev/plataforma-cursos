import type { DateKey } from '@/shared/domain/types/date-key.type';
import { formatDayMonth } from './format-day-month';

export function formatDayMonthYear(key: DateKey): string {
  return `${formatDayMonth(key)} ${key.slice(0, 4)}`;
}

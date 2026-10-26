import type { DateKey } from '@/shared/domain/types/date-key.type';
import { dayOfWeek } from './day-of-week';
import { formatDayMonth } from './format-day-month';
import { WEEKDAY_LONG_NAMES } from './weekday-long-names';

export function formatFullDate(key: DateKey): string {
  return `${WEEKDAY_LONG_NAMES[dayOfWeek(key)]}, ${formatDayMonth(key)}`;
}

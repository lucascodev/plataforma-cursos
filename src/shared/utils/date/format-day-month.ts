import type { DateKey } from '@/shared/domain/types/date-key.type';
import { MONTH_SHORT_NAMES } from './month-short-names';

export function formatDayMonth(key: DateKey): string {
  const [, month = 1, day = 1] = key.split('-').map(Number);
  return `${day} ${MONTH_SHORT_NAMES[month - 1] ?? ''}`;
}

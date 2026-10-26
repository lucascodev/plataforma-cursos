import type { DateKey } from '@/shared/domain/types/date-key.type';
import { MONTH_SHORT_NAMES } from './month-short-names';

export function formatMonthYear(key: DateKey): string {
  const [year = 0, month = 1] = key.split('-').map(Number);
  return `${MONTH_SHORT_NAMES[month - 1] ?? ''}/${String(year).slice(2)}`;
}

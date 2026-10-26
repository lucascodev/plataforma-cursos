import type { DateKey } from '@/shared/domain/types/date-key.type';
import { daysBetween } from '@/shared/utils/date/days-between';

const AVERAGE_DAYS_PER_MONTH = 30.44;

export function calculateMonthsElapsed(startDate: DateKey, today: DateKey, totalMonths: number): number {
  const months = daysBetween(startDate, today) / AVERAGE_DAYS_PER_MONTH;
  return Math.min(totalMonths, Math.max(0, months));
}

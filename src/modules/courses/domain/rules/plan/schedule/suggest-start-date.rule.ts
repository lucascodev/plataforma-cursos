import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from '@/shared/utils/date/calendar/add-days';
import { dayOfWeek } from '@/shared/utils/date/calendar/day-of-week';

export function suggestStartDate(today: DateKey): DateKey {
  return addDays(today, (8 - dayOfWeek(today)) % 7);
}

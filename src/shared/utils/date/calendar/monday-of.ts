import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from './add-days';
import { dayOfWeek } from './day-of-week';

export function mondayOf(key: DateKey): DateKey {
  return addDays(key, -((dayOfWeek(key) + 6) % 7));
}

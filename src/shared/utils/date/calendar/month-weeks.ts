import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from './add-days';
import { mondayOf } from './monday-of';

const DAYS_IN_WEEK = 7;

// Weeks (Monday first) covering a month given as "YYYY-MM", including the days of the neighbour months that fill them.
export function monthWeeks(month: string): DateKey[][] {
  const first = `${month}-01`;
  const weeks: DateKey[][] = [];
  let cursor = mondayOf(first);
  while (weeks.length === 0 || cursor.startsWith(month)) {
    weeks.push(Array.from({ length: DAYS_IN_WEEK }, (_, offset) => addDays(cursor, offset)));
    cursor = addDays(cursor, DAYS_IN_WEEK);
  }
  return weeks;
}

import { describe, expect, it } from 'vitest';
import { addDays } from './add-days';
import { dayOfWeek } from './day-of-week';
import { daysBetween } from './days-between';
import { formatDayMonth } from './format-day-month';
import { formatMonthYear } from './format-month-year';
import { isDateKey } from '@contracts/is-date-key';
import { mondayOf } from './monday-of';

describe('date utils', () => {
  it('adds days across months and years', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28');
  });

  it('finds the weekday and the monday of a week', () => {
    expect(dayOfWeek('2026-10-26')).toBe(1);
    expect(dayOfWeek('2026-11-01')).toBe(0);
    expect(mondayOf('2026-11-01')).toBe('2026-10-26');
    expect(mondayOf('2026-10-26')).toBe('2026-10-26');
  });

  it('counts days between dates', () => {
    expect(daysBetween('2026-10-26', '2026-11-01')).toBe(6);
  });

  it('validates real calendar dates only', () => {
    expect(isDateKey('2026-02-28')).toBe(true);
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('26-10-2026')).toBe(false);
    expect(isDateKey(42)).toBe(false);
  });

  it('formats dates in Portuguese', () => {
    expect(formatDayMonth('2026-10-26')).toBe('26 out');
    expect(formatMonthYear('2027-01-05')).toBe('jan/27');
  });
});

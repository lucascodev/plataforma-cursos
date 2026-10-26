import { describe, expect, it } from 'vitest';
import { addDays } from './calendar/add-days';
import { dayOfWeek } from './calendar/day-of-week';
import { daysBetween } from './calendar/days-between';
import { formatDayMonth } from './format/format-day-month';
import { formatMonthYear } from './format/format-month-year';
import { isDateKey } from '@contracts/date/is-date-key';
import { mondayOf } from './calendar/monday-of';
import { addMonths } from './calendar/add-months';
import { monthWeeks } from './calendar/month-weeks';
import { formatMonthTitle } from './format/format-month-title';

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

  it('builds the weeks of a month, Monday first', () => {
    const weeks = monthWeeks('2027-01');
    expect(weeks[0]?.[0]).toBe('2026-12-28');
    expect(weeks.at(-1)?.at(-1)).toBe('2027-01-31');
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(monthWeeks('2026-02').length).toBe(5);
  });

  it('moves between months and names them', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2027-01', -1)).toBe('2026-12');
    expect(formatMonthTitle('2027-03')).toBe('Março de 2027');
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

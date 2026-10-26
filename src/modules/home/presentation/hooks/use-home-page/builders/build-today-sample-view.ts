import { hoursForWeekday, type CourseSummaryOutputDto } from '@/modules/courses';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from '@/shared/utils/date/calendar/add-days';
import { dayOfWeek } from '@/shared/utils/date/calendar/day-of-week';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { WEEKDAY_SHORT_NAMES } from '@/shared/utils/date/names/weekday-short-names';
import { describeRhythm } from '../../../formatters/describe-rhythm';
import type { TodaySampleView } from '../../../types/today-sample-view.type';

const DAYS_IN_WEEK = 7;

// What the first study day of the featured course would look like if someone started today.
export function buildTodaySampleView(course: CourseSummaryOutputDto, today: DateKey): TodaySampleView {
  return {
    dateLabel: `Hoje · ${formatFullDate(today)}`,
    hoursLabel: `${hoursForWeekday(dayOfWeek(today), course.rhythm)} h`,
    courseLabel: `${course.title} · Início`,
    title: course.kickoff.title,
    detail: course.kickoff.detail,
    week: Array.from({ length: DAYS_IN_WEEK }, (_, offset) => {
      const key = addDays(today, offset);
      return { key, weekday: WEEKDAY_SHORT_NAMES[dayOfWeek(key)] ?? '', day: String(Number(key.slice(8))), isToday: offset === 0 };
    }),
    rhythmText: describeRhythm(course.rhythm),
  };
}

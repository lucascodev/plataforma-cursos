import type { CourseProgress } from '@/modules/progress';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { dayOfWeek } from '@/shared/utils/date/calendar/day-of-week';
import { formatDayMonth } from '@/shared/utils/date/format/format-day-month';
import { WEEKDAY_LONG_NAMES } from '@/shared/utils/date/names/weekday-long-names';
import { WEEKDAY_SHORT_NAMES } from '@/shared/utils/date/names/weekday-short-names';
import type { Course } from '../../../domain/entities/course/course.entity';
import type { StudyPlan } from '../../../domain/entities/plan/study-plan.entity';
import { describeStudyDay } from '../../formatters/describe-study-day';
import type { WeekDayView } from '../../types/week-day-view.type';

export function buildWeekDayViews(
  course: Course,
  plan: StudyPlan,
  progress: CourseProgress,
  dates: readonly DateKey[],
  today: DateKey,
): WeekDayView[] {
  return dates.map((date) => {
    const weekday = dayOfWeek(date);
    const base = {
      date,
      weekdayShort: WEEKDAY_SHORT_NAMES[weekday] ?? '',
      weekdayLong: WEEKDAY_LONG_NAMES[weekday] ?? '',
      dayMonth: formatDayMonth(date),
      isToday: date === today,
      journalText: progress.journal[date] ?? '',
    };
    const day = plan.dayByDate.get(date);
    if (!day) {
      return { ...base, inPlan: false, isLate: false, isDone: false, title: 'Fora do plano', reference: '', hours: 0, detail: '', itemId: null, itemLabel: null, isItemDone: false };
    }
    const text = describeStudyDay(course, day);
    const isDone = date in progress.studyDays;
    return {
      ...base,
      inPlan: true,
      isLate: date < today && !isDone,
      isDone,
      title: text.title,
      reference: text.reference,
      hours: day.hours,
      detail: text.detail,
      itemId: day.itemId,
      itemLabel: text.itemLabel,
      isItemDone: day.itemId ? day.itemId in progress.completedItems : false,
    };
  });
}

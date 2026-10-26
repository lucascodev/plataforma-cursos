import type { CourseProgress } from '@/modules/progress';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { formatDayMonth } from '@/shared/utils/date/format/format-day-month';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { WEEKDAY_SHORT_NAMES } from '@/shared/utils/date/names/weekday-short-names';
import type { Course } from '../../../../domain/entities/course/course.entity';
import type { StudyPlan } from '../../../../domain/entities/plan/study-plan.entity';
import { describeStudyDay } from '../../../formatters/describe-study-day';
import type { TodayView } from '../../../types/plan/today-view.type';

export function buildTodayView(course: Course, plan: StudyPlan, progress: CourseProgress, today: DateKey): TodayView | null {
  const first = plan.days[0];
  const last = plan.days.at(-1);
  if (!first || !last) return null;

  const day = today < first.date ? first : today > last.date ? last : (plan.dayByDate.get(today) ?? first);
  const kicker =
    today < first.date ? `Começa ${formatFullDate(first.date)}` : today > last.date ? 'Plano concluído · último dia' : `Hoje · ${formatFullDate(today)}`;
  const text = describeStudyDay(course, day);
  const next = plan.days[day.index + 1];

  return {
    kicker,
    reference: text.reference,
    hoursLabel: `${day.hours} h${day.weekday === 6 ? ' · sessão longa' : ''}`,
    title: text.title,
    detail: text.detail,
    date: day.date,
    isDone: day.date in progress.studyDays,
    itemId: day.itemId,
    itemLabel: text.itemLabel,
    isItemDone: day.itemId ? day.itemId in progress.completedItems : false,
    journalText: progress.journal[day.date] ?? '',
    hint: progress.startDateSource === 'suggested' ? 'O plano começou na data sugerida. Para mudar, use o campo Início no topo da página.' : null,
    next: next ? { title: describeStudyDay(course, next).title, when: `${WEEKDAY_SHORT_NAMES[next.weekday]} ${formatDayMonth(next.date)}` } : null,
  };
}

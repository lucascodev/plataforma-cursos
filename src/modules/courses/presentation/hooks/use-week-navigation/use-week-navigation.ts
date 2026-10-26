import { useState } from 'react';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from '@/shared/utils/date/calendar/add-days';
import { daysBetween } from '@/shared/utils/date/calendar/days-between';
import { formatDayMonth } from '@/shared/utils/date/format/format-day-month';
import { mondayOf } from '@/shared/utils/date/calendar/monday-of';
import type { StudyPlan } from '../../../domain/entities/plan/study-plan.entity';

const DAYS_PER_WEEK = 7;

export function useWeekNavigation(plan: StudyPlan, today: DateKey) {
  const firstWeek = mondayOf(plan.days[0]?.date ?? today);
  const lastWeek = mondayOf(plan.days.at(-1)?.date ?? today);
  const clamp = (week: DateKey) => (week < firstWeek ? firstWeek : week > lastWeek ? lastWeek : week);
  const [selectedWeek, setSelectedWeek] = useState<DateKey | null>(null);
  const weekStart = clamp(selectedWeek ?? mondayOf(today));

  return {
    weekStart,
    dates: Array.from({ length: DAYS_PER_WEEK }, (_, index) => addDays(weekStart, index)),
    label: `Semana ${daysBetween(firstWeek, weekStart) / DAYS_PER_WEEK + 1} de ${daysBetween(firstWeek, lastWeek) / DAYS_PER_WEEK + 1} · ${formatDayMonth(weekStart)} a ${formatDayMonth(addDays(weekStart, 6))}`,
    canGoBack: weekStart > firstWeek,
    canGoForward: weekStart < lastWeek,
    goBack: () => setSelectedWeek(clamp(addDays(weekStart, -DAYS_PER_WEEK))),
    goForward: () => setSelectedWeek(clamp(addDays(weekStart, DAYS_PER_WEEK))),
    goToCurrent: () => setSelectedWeek(null),
  };
}

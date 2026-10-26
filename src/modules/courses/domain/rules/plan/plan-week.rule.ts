import type { DateKey } from '@/shared/domain/types/date-key.type';
import { daysBetween } from '@/shared/utils/date/calendar/days-between';
import type { PlanWeek } from '../../entities/plan/plan-week.entity';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';

const DAYS_IN_WEEK = 7;

// Week 1 starts on the plan's first day; dates before or after the plan are clamped to the first or last week.
export function planWeek(plan: StudyPlan, date: DateKey): PlanWeek {
  const lastDate = plan.days.at(-1)?.date ?? plan.startDate;
  const totalWeeks = Math.floor(daysBetween(plan.startDate, lastDate) / DAYS_IN_WEEK) + 1;
  const week = Math.floor(daysBetween(plan.startDate, date) / DAYS_IN_WEEK) + 1;
  return { week: Math.min(Math.max(week, 1), totalWeeks), totalWeeks };
}

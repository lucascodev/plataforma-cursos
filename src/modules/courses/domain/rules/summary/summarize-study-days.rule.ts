import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from '@/shared/utils/date/add-days';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';
import type { StudyDaysSummary } from '../../entities/summary/study-days-summary.entity';

export function summarizeStudyDays(plan: StudyPlan, isDayDone: (date: DateKey) => boolean, today: DateKey): StudyDaysSummary {
  const completed = plan.days.filter((day) => isDayDone(day.date)).length;
  const late = plan.days.filter((day) => day.date < today && !isDayDone(day.date)).length;

  let streak = 0;
  let cursor = isDayDone(today) ? today : addDays(today, -1);
  while (plan.dayByDate.has(cursor) && isDayDone(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return { completed, total: plan.days.length, late, streak };
}

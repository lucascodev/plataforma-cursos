import type { PlanSpan } from '../../entities/plan/plan-span.entity';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';

export function planSpan(plan: StudyPlan): PlanSpan {
  return {
    studyDays: plan.days.length,
    firstDate: plan.days[0]?.date ?? plan.startDate,
    lastDate: plan.days.at(-1)?.date ?? plan.startDate,
  };
}

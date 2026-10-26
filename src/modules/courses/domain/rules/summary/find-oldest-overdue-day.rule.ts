import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';

export function findOldestOverdueDay(plan: StudyPlan, isDayDone: (date: DateKey) => boolean, today: DateKey): DateKey | null {
  return plan.days.find((day) => day.date < today && !isDayDone(day.date))?.date ?? null;
}

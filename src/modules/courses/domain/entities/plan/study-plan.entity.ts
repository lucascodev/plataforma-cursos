import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { ModuleDateRange } from './module-date-range.entity';
import type { StudyDay } from './study-day.entity';

export interface StudyPlan {
  readonly startDate: DateKey;
  readonly days: readonly StudyDay[];
  readonly dayByDate: ReadonlyMap<DateKey, StudyDay>;
  readonly moduleRanges: ReadonlyMap<number, ModuleDateRange>;
}

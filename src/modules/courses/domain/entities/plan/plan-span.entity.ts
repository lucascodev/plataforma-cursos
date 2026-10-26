import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface PlanSpan {
  readonly studyDays: number;
  readonly firstDate: DateKey;
  readonly lastDate: DateKey;
}

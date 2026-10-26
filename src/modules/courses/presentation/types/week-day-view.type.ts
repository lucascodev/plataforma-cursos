import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface WeekDayView {
  readonly date: DateKey;
  readonly weekdayShort: string;
  readonly weekdayLong: string;
  readonly dayMonth: string;
  readonly inPlan: boolean;
  readonly isToday: boolean;
  readonly isLate: boolean;
  readonly isDone: boolean;
  readonly title: string;
  readonly reference: string;
  readonly hours: number;
  readonly detail: string;
  readonly itemId: string | null;
  readonly itemLabel: string | null;
  readonly isItemDone: boolean;
  readonly journalText: string;
}

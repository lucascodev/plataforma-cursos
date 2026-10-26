import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface TodayView {
  readonly kicker: string;
  readonly reference: string;
  readonly hoursLabel: string;
  readonly title: string;
  readonly detail: string;
  readonly date: DateKey;
  readonly isDone: boolean;
  readonly itemId: string | null;
  readonly itemLabel: string | null;
  readonly isItemDone: boolean;
  readonly journalText: string;
  readonly hint: string | null;
  readonly next: { readonly title: string; readonly when: string } | null;
}

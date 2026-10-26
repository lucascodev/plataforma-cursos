import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface JournalEntry {
  readonly date: DateKey;
  readonly text: string;
  /** Null for days outside the plan or not tied to a module (kickoff). */
  readonly moduleIndex: number | null;
}

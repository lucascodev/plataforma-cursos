import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { JournalEntry } from '../../entities/journal/journal-entry.entity';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';

// Newest first; empty entries are left out.
export function listJournalEntries(journal: Readonly<Record<DateKey, string>>, plan: StudyPlan): JournalEntry[] {
  return Object.entries(journal)
    .filter(([, text]) => text.trim() !== '')
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, text]) => ({ date, text, moduleIndex: plan.dayByDate.get(date)?.moduleIndex ?? null }));
}

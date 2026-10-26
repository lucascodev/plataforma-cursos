import { foldAccents } from '@/shared/utils/text/fold-accents';
import type { JournalEntry } from '../../entities/journal/journal-entry.entity';

export function filterJournalEntries(entries: readonly JournalEntry[], query: string, moduleIndex: number | null): JournalEntry[] {
  const words = foldAccents(query).split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    if (moduleIndex !== null && entry.moduleIndex !== moduleIndex) return false;
    const text = foldAccents(entry.text);
    return words.every((word) => text.includes(word));
  });
}

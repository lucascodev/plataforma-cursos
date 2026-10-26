import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { CourseProgress } from '../../entities/course-progress.entity';
import { setTextEntry } from './set-text-entry.rule';

export function setJournalEntry(progress: CourseProgress, date: DateKey, text: string): CourseProgress {
  return { ...progress, journal: setTextEntry(progress.journal, date, text) };
}

import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { StudyRhythm } from '../course/study-rhythm.entity';

export interface StudyCalendarInput {
  readonly courseSlug: string;
  readonly courseTitle: string;
  readonly courseUrl: string;
  readonly startDate: DateKey;
  readonly endDate: DateKey;
  readonly rhythm: StudyRhythm;
  /** UTC timestamp in the iCalendar basic format, e.g. 20261026T120000Z. */
  readonly stampedAt: string;
}

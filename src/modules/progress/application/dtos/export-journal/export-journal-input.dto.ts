import type { CourseProgress } from '../../../domain/entities/course-progress.entity';
import type { JournalExport } from '../../../domain/entities/journal-export.entity';

export interface ExportJournalInputDto {
  readonly courseSlug: string;
  readonly progress: CourseProgress;
  readonly journalExport: JournalExport;
}

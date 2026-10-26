import type { CourseProgress } from '../../domain/entities/course-progress.entity';
import type { CourseProgressRecord } from '@contracts/progress/course-progress.schema';

export function mapProgressRecordToEntity(record: CourseProgressRecord): CourseProgress {
  return {
    completedItems: record.completedItems,
    studyDays: record.studyDays,
    moduleNotes: record.moduleNotes,
    journal: record.journal,
    projectChecks: record.projectChecks,
    projectDeliveries: record.projectDeliveries,
    startDate: record.startDate,
    startDateSource: record.startDateSource,
    updatedAt: record.updatedAt,
  };
}

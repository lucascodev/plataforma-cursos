import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { CourseProgress } from '../../entities/course-progress.entity';
import type { StartDateSource } from '../../entities/start-date-source.type';

export function setStartDate(progress: CourseProgress, startDate: DateKey, source: StartDateSource): CourseProgress {
  return { ...progress, startDate, startDateSource: source };
}

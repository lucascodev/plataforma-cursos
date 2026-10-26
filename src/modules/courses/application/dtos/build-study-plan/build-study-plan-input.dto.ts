import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { Course } from '../../../domain/entities/course/course.entity';

export interface BuildStudyPlanInputDto {
  readonly course: Course;
  readonly startDate: DateKey;
}

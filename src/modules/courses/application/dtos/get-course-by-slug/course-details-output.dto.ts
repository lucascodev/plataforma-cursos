import type { Course } from '../../../domain/entities/course/course.entity';
import type { CourseTotals } from '../../../domain/entities/summary/course-totals.entity';

export interface CourseDetailsOutputDto {
  readonly course: Course;
  readonly totals: CourseTotals;
}

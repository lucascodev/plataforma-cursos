import type { CourseProgressState } from '@/modules/progress';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import type { CourseStudy } from './course-study.type';

// What the study layout hands to every page under /cursos/:slug.
export interface StudyContext {
  readonly details: CourseDetailsOutputDto;
  readonly progressState: CourseProgressState;
  readonly study: CourseStudy;
}

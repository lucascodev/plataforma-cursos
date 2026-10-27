import type { AdminCourseStatus } from '../../domain/types/admin-course-status.type';

export interface ListCoursesInputDto {
  readonly query: string;
  readonly status: AdminCourseStatus | null;
}

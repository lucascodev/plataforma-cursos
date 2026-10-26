import type { CourseModuleKind } from '../../../domain/entities/course/module/course-module-kind.type';

export interface CourseModuleSummaryOutputDto {
  readonly id: string;
  readonly code: string;
  readonly shortTitle: string;
  readonly title: string;
  readonly kind: CourseModuleKind;
  readonly months: number;
  readonly lessonCount: number;
  readonly projectTitle: string;
}

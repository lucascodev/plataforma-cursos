import type { CourseModuleKind } from '../../entities/course/module/course-module-kind.type';

// Continuous modules (career, run on Sundays) have no project to hand in.
export function deliversProject(kind: CourseModuleKind): boolean {
  return kind !== 'continuous';
}

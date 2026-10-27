import type { CourseCheck } from '../../../contracts/course/checks/course-check.type';
import { runCourseChecks } from '../../../contracts/course/checks/run-course-checks';

export function findCourseErrors(content: unknown): CourseCheck[] {
  return runCourseChecks(content).filter((check) => check.severity === 'error');
}

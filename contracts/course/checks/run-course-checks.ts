import { courseContentSchema } from '../course-content.schema.ts';
import type { CourseCheck } from './course-check.type.ts';
import { courseIssueMessage } from './course-issue-message.ts';
import { describeCoursePath } from './describe-course-path.ts';
import { findCourseWarnings } from './find-course-warnings.ts';

// Errors come from the same schema the site uses to read a course, so a course that passes always opens.
export function runCourseChecks(content: unknown): CourseCheck[] {
  const parsed = courseContentSchema.safeParse(content, { error: courseIssueMessage });
  const errors: CourseCheck[] = parsed.success
    ? []
    : parsed.error.issues.map((issue) => ({
        severity: 'error',
        path: issue.path.filter((part): part is string | number => typeof part !== 'symbol'),
        where: describeCoursePath(issue.path),
        message: issue.message,
      }));
  return [...errors, ...findCourseWarnings(content)];
}

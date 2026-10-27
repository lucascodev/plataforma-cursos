import type { CourseContent } from '@contracts/course/course-content.schema';

// The editor works on the full course shape. Fields may still be empty: the checks say what is missing before sending.
export type EditableCourse = CourseContent;

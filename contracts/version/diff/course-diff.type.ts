import type { CourseChange } from './course-change.type.ts';

export interface CourseDiff {
  readonly changes: readonly CourseChange[];
  // Progress keys ("<moduleId>-<itemId>") of lessons and drills that this version removes.
  readonly removedItemKeys: readonly string[];
}

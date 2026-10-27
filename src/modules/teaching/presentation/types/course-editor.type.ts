import type { CourseCheck } from '@contracts/course/checks/course-check.type';
import type { CourseDiff } from '@contracts/version/diff/course-diff.type';
import type { EditableCourse } from '../../domain/entities/draft/editable-course.entity';
import type { SaveStatus } from './save-status.type';

export interface CourseEditor {
  readonly course: EditableCourse;
  readonly isEditable: boolean;
  readonly saveStatus: SaveStatus;
  readonly checks: readonly CourseCheck[];
  readonly diff: CourseDiff;
  readonly update: (change: (course: EditableCourse) => EditableCourse) => void;
  /** Saves what is pending now. Resolves to the revision saved, or null if saving failed. */
  readonly flush: () => Promise<number | null>;
}

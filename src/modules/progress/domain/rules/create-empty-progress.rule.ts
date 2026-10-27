import type { CourseProgress } from '../entities/course-progress.entity';

export function createEmptyProgress(): CourseProgress {
  return {
    completedItems: {},
    studyDays: {},
    moduleNotes: {},
    journal: {},
    projectChecks: {},
    projectDeliveries: {},
    exercises: {},
    startDate: null,
    startDateSource: null,
    updatedAt: null,
  };
}

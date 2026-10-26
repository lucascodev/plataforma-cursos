import type { CourseProgress } from '../../entities/course-progress.entity';
import type { ProjectDelivery } from '../../entities/project-delivery.entity';
import { setFlag } from './set-flag.rule';

// Handing in the project also marks the module project item as done, so plan and percentages count it.
export function deliverProject(progress: CourseProgress, moduleId: string, projectItemId: string, delivery: ProjectDelivery): CourseProgress {
  return {
    ...progress,
    projectDeliveries: { ...progress.projectDeliveries, [moduleId]: delivery },
    completedItems: setFlag(progress.completedItems, projectItemId, true),
  };
}

import type { CourseTaskText } from './course-task-text.entity';
import type { SundayMilestone } from './sunday-milestone.entity';

export interface SundayTrack {
  readonly moduleId: string;
  readonly rotation: readonly CourseTaskText[];
  readonly milestones: readonly SundayMilestone[];
}

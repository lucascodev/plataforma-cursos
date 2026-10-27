import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { ExerciseProgress } from './exercise-progress.entity';
import type { ProjectChecks } from './project-checks.entity';
import type { ProjectDelivery } from './project-delivery.entity';
import type { StartDateSource } from './start-date-source.type';

export interface CourseProgress {
  readonly completedItems: Readonly<Record<string, true>>;
  readonly studyDays: Readonly<Record<DateKey, true>>;
  readonly moduleNotes: Readonly<Record<string, string>>;
  readonly journal: Readonly<Record<DateKey, string>>;
  readonly projectChecks: Readonly<Record<string, ProjectChecks>>;
  readonly projectDeliveries: Readonly<Record<string, ProjectDelivery>>;
  readonly exercises: Readonly<Record<string, ExerciseProgress>>;
  readonly startDate: DateKey | null;
  readonly startDateSource: StartDateSource | null;
  readonly updatedAt: string | null;
}

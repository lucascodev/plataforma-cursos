import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { CourseProgress } from '../../../domain/entities/course-progress.entity';
import type { ProjectDelivery } from '../../../domain/entities/project-delivery.entity';
import type { StartDateSource } from '../../../domain/entities/start-date-source.type';
import type { ProjectCheckKind } from '../../../domain/types/project-check-kind.type';

export interface CourseProgressActions {
  setItemCompleted(itemId: string, completed: boolean): void;
  setStudyDayDone(date: DateKey, done: boolean): void;
  setModuleNote(moduleId: string, text: string): void;
  setJournalEntry(date: DateKey, text: string): void;
  setStartDate(date: DateKey, source: StartDateSource): void;
  setProjectCheck(moduleId: string, kind: ProjectCheckKind, checkId: string, checked: boolean): void;
  deliverProject(moduleId: string, projectItemId: string, delivery: ProjectDelivery): void;
  replaceProgress(progress: CourseProgress): void;
  eraseProgress(): Promise<void>;
  retryLoading(): void;
}

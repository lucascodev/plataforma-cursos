import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { StudyTaskKind } from './study-task-kind.type';

export interface ProjectStage {
  readonly kind: Extract<StudyTaskKind, 'project-plan' | 'project-build' | 'project-evaluate' | 'project-publish'>;
  readonly firstDate: DateKey;
  readonly lastDate: DateKey;
  readonly days: number;
}

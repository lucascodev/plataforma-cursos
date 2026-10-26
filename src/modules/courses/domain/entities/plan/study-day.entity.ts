import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { StudyTask } from './study-task.entity';

export interface StudyDay extends StudyTask {
  readonly index: number;
  readonly date: DateKey;
  readonly weekday: number;
  readonly hours: number;
}

import type { StudyTaskKind } from './study-task-kind.type';

export interface StudyTask {
  readonly kind: StudyTaskKind;
  readonly moduleIndex: number | null;
  readonly lessonIndex: number | null;
  readonly drillIndex: number | null;
  readonly part: number;
  readonly parts: number;
  readonly requirementIndex: number | null;
  readonly sundayIndex: number | null;
  readonly trackEntryIndex: number | null;
  readonly itemId: string | null;
}

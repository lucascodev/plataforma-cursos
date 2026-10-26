import type { CourseProgress } from '../../../domain/entities/course-progress.entity';
import type { CourseProgressActions } from './course-progress-actions.type';
import type { SaveState } from './save-state.type';

export interface CourseProgressState {
  readonly status: 'loading' | 'ready' | 'error';
  readonly progress: CourseProgress | null;
  readonly saveState: SaveState;
  readonly actions: CourseProgressActions;
}

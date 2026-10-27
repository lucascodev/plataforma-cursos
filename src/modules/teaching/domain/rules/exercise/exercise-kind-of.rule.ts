import type { EditableLessonExercise } from '../../entities/draft/editable-exercise.entity';
import type { ExerciseKind } from '../../types/exercise-kind.type';

export function exerciseKindOf(exercise: EditableLessonExercise): ExerciseKind {
  return typeof exercise === 'string' ? 'text' : exercise.type;
}

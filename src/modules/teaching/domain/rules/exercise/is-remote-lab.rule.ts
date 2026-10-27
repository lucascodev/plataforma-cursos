import type { EditableLessonExercise } from '../../entities/draft/editable-exercise.entity';

// Codespaces and local labs are checked by a completion code the teacher registers; browser labs check themselves.
export function isRemoteLab(exercise: EditableLessonExercise): boolean {
  return typeof exercise !== 'string' && exercise.type === 'lab' && exercise.environment !== 'browser';
}

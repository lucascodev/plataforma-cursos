import type { LessonExercise } from '../../entities/course/module/exercise/exercise.entity';

export function exercisePrompt(exercise: LessonExercise): string {
  return typeof exercise === 'string' ? exercise : exercise.prompt;
}

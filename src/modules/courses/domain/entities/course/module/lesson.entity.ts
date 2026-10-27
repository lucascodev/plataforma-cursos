import type { LessonExercise } from './exercise/exercise.entity';

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly exercise: LessonExercise;
}

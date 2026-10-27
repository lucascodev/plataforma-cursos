import type { ExerciseRecord } from '@contracts/course/exercise/exercise.schema';

// Lessons written before exercise types existed keep a plain text exercise.
export type Exercise = ExerciseRecord;
export type LessonExercise = string | Exercise;

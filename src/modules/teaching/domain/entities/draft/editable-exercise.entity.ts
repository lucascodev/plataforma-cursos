import type { EditableLesson } from './editable-module.entity';

export type EditableLessonExercise = EditableLesson['exercise'];
export type EditableExercise = Exclude<EditableLessonExercise, string>;
export type EditableExerciseType = EditableExercise['type'];

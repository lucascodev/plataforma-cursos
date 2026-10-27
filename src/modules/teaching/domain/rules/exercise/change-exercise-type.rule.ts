import type { EditableExercise, EditableLessonExercise } from '../../entities/draft/editable-exercise.entity';
import type { ExerciseKind } from '../../types/exercise-kind.type';
import { createExercise } from './create-exercise.rule';

type CommonFields = Pick<EditableExercise, 'estimatedMinutes' | 'difficulty' | 'hints' | 'doneCriteria' | 'stuckTips' | 'solution'>;

function commonFields(exercise: EditableExercise): CommonFields {
  const { estimatedMinutes, difficulty, hints, doneCriteria, stuckTips, solution } = exercise;
  return Object.fromEntries(
    Object.entries({ estimatedMinutes, difficulty, hints, doneCriteria, stuckTips, solution }).filter(([, value]) => value !== undefined),
  ) as CommonFields;
}

// Changing the type keeps what the teacher already wrote that still makes sense: the prompt, the hints, the criteria
// and the solution. What belongs to the old type alone (questions, steps, files) goes away.
export function changeExerciseType(current: EditableLessonExercise, next: ExerciseKind, random: () => number): EditableLessonExercise {
  const prompt = typeof current === 'string' ? current : current.prompt;
  if (next === 'text') return prompt;
  if (typeof current !== 'string' && current.type === next) return current;
  const kept = typeof current === 'string' ? {} : commonFields(current);
  return { ...createExercise(next, random), ...kept, prompt };
}

import type { EditableExercise } from '../../entities/draft/editable-exercise.entity';
import { createItemId } from '../draft/create-item-id.rule';
import { idsOf } from './ids-of';

type Step = Extract<EditableExercise, { type: 'steps' }>['steps'][number];

export function createExerciseStep(steps: readonly Step[], random: () => number): Step {
  return { id: createItemId('p', idsOf(steps), random), title: '' };
}

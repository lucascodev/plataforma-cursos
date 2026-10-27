import type { EditableExercise } from '../../entities/draft/editable-exercise.entity';
import { createItemId } from '../draft/create-item-id.rule';
import { idsOf } from './ids-of';

type LabCheck = Extract<EditableExercise, { type: 'lab' }>['checks'][number];

export function createLabCheck(checks: readonly LabCheck[], random: () => number): LabCheck {
  return { id: createItemId('c', idsOf(checks), random), title: '' };
}

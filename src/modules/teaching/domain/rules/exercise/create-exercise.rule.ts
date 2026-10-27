import type { EditableExercise, EditableExerciseType } from '../../entities/draft/editable-exercise.entity';
import { createExerciseStep } from './create-exercise-step.rule';
import { createLabCheck } from './create-lab-check.rule';
import { createQuizQuestion } from './create-quiz-question.rule';

const FIRST_LAB_FILE = 'main.py';

// The smallest version of each type the editor can show: lists start with one entry to fill in.
export function createExercise(type: EditableExerciseType, random: () => number): EditableExercise {
  switch (type) {
    case 'delivery':
      return { type, prompt: '', deliver: 'link' };
    case 'quiz':
      return { type, prompt: '', questions: [createQuizQuestion([], random)] };
    case 'code':
      return { type, prompt: '', language: 'python', starter: '', tests: '' };
    case 'steps':
      return { type, prompt: '', steps: [createExerciseStep([], random)] };
    case 'reflection':
      return { type, prompt: '', question: '' };
    case 'lab':
      return { type, prompt: '', environment: 'browser', runtime: 'python', files: [{ name: FIRST_LAB_FILE, content: '' }], checks: [createLabCheck([], random)] };
  }
}

import type { ExerciseKind } from '../../../domain/types/exercise-kind.type';

export const EXERCISE_KIND_OPTIONS: readonly { readonly value: ExerciseKind; readonly label: string }[] = [
  { value: 'text', label: 'Texto simples' },
  { value: 'delivery', label: 'Entrega (link ou texto)' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'code', label: 'Código com testes' },
  { value: 'steps', label: 'Passo a passo' },
  { value: 'reflection', label: 'Reflexão no diário' },
  { value: 'lab', label: 'Laboratório' },
];

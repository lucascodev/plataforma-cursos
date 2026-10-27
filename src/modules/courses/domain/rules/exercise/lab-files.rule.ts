import type { ExerciseProgress } from '@/modules/progress';
import type { Exercise } from '../../entities/course/module/exercise/exercise.entity';

type Lab = Extract<Exercise, { type: 'lab' }>;

// The files as the person last left them, falling back to the starting files of the lab.
export function labFiles(lab: Lab, state: ExerciseProgress): Record<string, string> {
  return Object.fromEntries((lab.files ?? []).map((file) => [file.name, state.files[file.name] ?? file.content]));
}

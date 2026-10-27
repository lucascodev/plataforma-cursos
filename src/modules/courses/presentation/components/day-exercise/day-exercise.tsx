import type { CourseProgressState } from '@/modules/progress';
import type { Exercise } from '../../../domain/entities/course/module/exercise/exercise.entity';
import { useExercise } from '../../hooks/use-exercise/use-exercise';
import { ExercisePanel } from '../exercise-panel/exercise-panel';

interface DayExerciseProps {
  readonly courseSlug: string;
  readonly itemKey: string;
  readonly exercise: Exercise;
  readonly progressState: CourseProgressState;
  readonly journalText: string;
  readonly setJournalText: (value: string) => void;
}

export function DayExercise(props: DayExerciseProps) {
  const view = useExercise(props);
  return <ExercisePanel view={view} />;
}

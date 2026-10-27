import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import type { ExerciseView } from '../../../../types/exercise/exercise-view.type';
import styles from '../../../../styles/exercise.module.css';

type Reflection = Extract<ExerciseView['exercise'], { type: 'reflection' }>;

export function ReflectionBody({ exercise, view }: { readonly exercise: Reflection; readonly view: ExerciseView }) {
  return (
    <section className={styles.section} aria-labelledby="reflexao">
      <h3 id="reflexao" className={styles.heading}>
        {exercise.question}
      </h3>
      <TextAreaField
        label="Sua resposta"
        hint="Vai para o diário deste dia. Ninguém mais lê, nem o professor."
        rows={6}
        value={view.journalText}
        onChange={(event) => view.setJournalText(event.target.value)}
      />
    </section>
  );
}

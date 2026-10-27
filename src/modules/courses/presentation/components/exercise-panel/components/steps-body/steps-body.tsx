import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import { CodeBlock } from '@/shared/presentation/components/data/code-block/code-block';
import type { ExerciseView } from '../../../../types/exercise/exercise-view.type';
import styles from '../../../../styles/exercise.module.css';

type Steps = Extract<ExerciseView['exercise'], { type: 'steps' }>;

export function StepsBody({ exercise, view }: { readonly exercise: Steps; readonly view: ExerciseView }) {
  const done = exercise.steps.filter((step) => view.state.stepsDone.includes(step.id)).length;
  // Each step opens after the previous one is confirmed, so the person goes in order.
  const firstOpen = exercise.steps.findIndex((step) => !view.state.stepsDone.includes(step.id));
  const visible = firstOpen === -1 ? exercise.steps.length : firstOpen + 1;
  return (
    <section className={styles.section} aria-labelledby="passo-a-passo">
      <h3 id="passo-a-passo" className={styles.heading}>
        Passo a passo <span className={styles.count}>{done} de {exercise.steps.length}</span>
      </h3>
      <ol className={styles.list}>
        {exercise.steps.slice(0, visible).map((step) => (
          <li key={step.id} className={styles.item}>
            <CheckboxField checked={view.state.stepsDone.includes(step.id)} onChange={() => view.toggleStep(step.id)}>
              <strong>{step.title}</strong>
            </CheckboxField>
            {step.detail ? <p className={styles.muted}>{step.detail}</p> : null}
            {step.code ? <CodeBlock code={step.code} /> : null}
          </li>
        ))}
      </ol>
      {visible < exercise.steps.length ? <p className={styles.muted}>O próximo passo aparece quando você marcar este.</p> : null}
    </section>
  );
}

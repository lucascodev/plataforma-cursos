import { CircleCheck, Circle } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import type { ExerciseView } from '../../../../types/exercise/exercise-view.type';
import { CheckResults } from '../check-results/check-results';
import { LabFilesEditor } from './components/lab-files-editor/lab-files-editor';
import { LabRemoteSetup } from './components/lab-remote-setup/lab-remote-setup';
import styles from '../../../../styles/exercise.module.css';

type Lab = Extract<ExerciseView['exercise'], { type: 'lab' }>;

const ENVIRONMENTS: Readonly<Record<Lab['environment'], string>> = {
  browser: 'No navegador',
  codespaces: 'GitHub Codespaces',
  local: 'No seu computador',
};

export function LabBody({ exercise, view }: { readonly exercise: Lab; readonly view: ExerciseView }) {
  const titles = Object.fromEntries(exercise.checks.map((check) => [check.id, check.title]));
  const passed = exercise.checks.filter((check) => view.state.passedChecks.includes(check.id)).length;
  return (
    <section className={styles.section} aria-labelledby="laboratorio">
      <h3 id="laboratorio" className={styles.heading}>
        Laboratório · {ENVIRONMENTS[exercise.environment]} <span className={styles.count}>{passed} de {exercise.checks.length} etapas</span>
      </h3>
      <ol className={styles.list}>
        {exercise.checks.map((check) => {
          const isPassed = view.state.passedChecks.includes(check.id);
          return (
            <li key={check.id} className={isPassed ? styles.passed : ''}>
              {isPassed ? <CircleCheck size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />} {check.title}
              <span className={styles.count}>{isPassed ? ' · passou' : ''}</span>
            </li>
          );
        })}
      </ol>
      {exercise.environment === 'browser' ? (
        <>
          <LabFilesEditor view={view} />
          <div className={styles.actions}>
            <Button tone="primary" isLoading={view.isRunning} onClick={() => void view.run()}>
              Verificar etapas
            </Button>
            <span className={styles.muted}>Pode verificar quantas vezes quiser.</span>
          </div>
          {view.lastRun ? <CheckResults result={view.lastRun} titles={titles} /> : null}
        </>
      ) : (
        <LabRemoteSetup lab={exercise} view={view} />
      )}
    </section>
  );
}

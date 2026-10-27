import { Play } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import type { ExerciseView } from '../../../../types/exercise/exercise-view.type';
import { CheckResults } from '../check-results/check-results';
import styles from '../../../../styles/exercise.module.css';

type Code = Extract<ExerciseView['exercise'], { type: 'code' }>;

const LANGUAGES: Readonly<Record<Code['language'], string>> = { python: 'Python', javascript: 'JavaScript', sql: 'SQL' };

export function CodeBody({ exercise, view }: { readonly exercise: Code; readonly view: ExerciseView }) {
  return (
    <section className={styles.section} aria-labelledby="codigo">
      <h3 id="codigo" className={styles.heading}>
        Seu código <span className={styles.count}>{LANGUAGES[exercise.language]}</span>
      </h3>
      <label className={styles.section}>
        <span className={styles.muted}>Roda no seu navegador, num ambiente isolado. Nada para instalar.</span>
        <textarea
          className={styles.editor}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Editor de código"
          value={view.code}
          onChange={(event) => view.setCode(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <Button tone="primary" isLoading={view.isRunning} onClick={() => void view.run()}>
          <Play size={16} aria-hidden="true" />
          Rodar os testes
        </Button>
        <span className={styles.muted}>{view.isRunning ? 'Na primeira vez o ambiente leva alguns segundos para abrir.' : ''}</span>
      </div>
      {view.lastRun ? <CheckResults result={view.lastRun} /> : null}
    </section>
  );
}

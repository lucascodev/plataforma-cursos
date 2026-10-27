import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import type { ExerciseView } from '../../types/exercise/exercise-view.type';
import { CodeBody } from './components/code-body/code-body';
import { CriteriaChecklist } from './components/criteria-checklist/criteria-checklist';
import { DeliveryBody } from './components/delivery-body/delivery-body';
import { HintsBox } from './components/hints-box/hints-box';
import { LabBody } from './components/lab-body/lab-body';
import { QuizBody } from './components/quiz-body/quiz-body';
import { ReflectionBody } from './components/reflection-body/reflection-body';
import { SolutionBox } from './components/solution-box/solution-box';
import { StepsBody } from './components/steps-body/steps-body';
import styles from '../../styles/exercise.module.css';

const DIFFICULTY: Readonly<Record<'easy' | 'medium' | 'hard', string>> = { easy: 'Fácil', medium: 'Média', hard: 'Difícil' };

function ExerciseBody({ view }: { readonly view: ExerciseView }) {
  const { exercise } = view;
  switch (exercise.type) {
    case 'delivery':
      return <DeliveryBody exercise={exercise} view={view} />;
    case 'quiz':
      return <QuizBody exercise={exercise} view={view} />;
    case 'code':
      return <CodeBody exercise={exercise} view={view} />;
    case 'steps':
      return <StepsBody exercise={exercise} view={view} />;
    case 'reflection':
      return <ReflectionBody exercise={exercise} view={view} />;
    case 'lab':
      return <LabBody exercise={exercise} view={view} />;
  }
}

export function ExercisePanel({ view }: { readonly view: ExerciseView }) {
  const { exercise } = view;
  return (
    <div className={styles.panel}>
      <p className={styles.prompt}>{exercise.prompt}</p>
      {exercise.estimatedMinutes || exercise.difficulty ? (
        <p className={styles.meta}>
          {exercise.estimatedMinutes ? <Badge>≈ {exercise.estimatedMinutes} min</Badge> : null}
          {exercise.difficulty ? <Badge>Dificuldade {DIFFICULTY[exercise.difficulty].toLowerCase()}</Badge> : null}
        </p>
      ) : null}
      <ExerciseBody view={view} />
      {exercise.doneCriteria?.length ? <CriteriaChecklist criteria={exercise.doneCriteria} done={view.state.criteriaDone} onToggle={view.toggleCriterion} /> : null}
      {exercise.hints?.length ? <HintsBox hints={exercise.hints} opened={view.state.hintsOpened} onOpen={view.openHint} /> : null}
      {exercise.stuckTips?.length ? (
        <section className={styles.section} aria-labelledby="travou">
          <h3 id="travou" className={styles.heading}>
            Travou?
          </h3>
          <ul className={styles.list}>
            {exercise.stuckTips.map((tip) => (
              <li key={tip} className={styles.muted}>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {exercise.solution ? <SolutionBox solution={exercise.solution} isRevealed={view.isSolutionRevealed} /> : null}
      {view.isDone ? (
        <div className={styles.done} role="status">
          Exercício concluído
          <Button onClick={view.undo}>Desfazer</Button>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button tone="primary" size="lg" onClick={view.finish}>
            Concluir exercício
          </Button>
        </div>
      )}
      <Dialog
        open={view.isConfirmingFinish}
        title="Ainda falta algo"
        description={`Falta: ${view.missing.join(', ')}. Você pode concluir mesmo assim e voltar depois.`}
        onClose={view.cancelFinish}
        actions={
          <>
            <Button size="md" onClick={view.cancelFinish}>
              Voltar ao exercício
            </Button>
            <Button size="md" tone="primary" onClick={view.confirmFinish}>
              Concluir mesmo assim
            </Button>
          </>
        }
      />
    </div>
  );
}

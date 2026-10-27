import type { Exercise } from '../../../../../domain/entities/course/module/exercise/exercise.entity';
import styles from '../../../../styles/exercise.module.css';

const LOCKED: Readonly<Record<'after-done' | 'after-attempts', string>> = {
  'after-done': 'A solução de referência abre quando você concluir o exercício.',
  'after-attempts': 'A solução de referência abre depois de 3 tentativas ou quando você concluir.',
};

interface SolutionBoxProps {
  readonly solution: NonNullable<Exercise['solution']>;
  readonly isRevealed: boolean;
}

export function SolutionBox({ solution, isRevealed }: SolutionBoxProps) {
  if (solution.reveal === 'never') return null;
  return (
    <section className={styles.section} aria-labelledby="solucao">
      <h3 id="solucao" className={styles.heading}>
        Solução de referência
      </h3>
      {isRevealed ? <pre className={styles.code}>{solution.text}</pre> : <p className={styles.muted}>{LOCKED[solution.reveal]}</p>}
    </section>
  );
}

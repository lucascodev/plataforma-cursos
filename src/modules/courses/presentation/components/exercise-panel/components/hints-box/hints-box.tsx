import { Button } from '@/shared/presentation/components/actions/button/button';
import styles from '../../../../styles/exercise.module.css';

interface HintsBoxProps {
  readonly hints: readonly string[];
  readonly opened: number;
  readonly onOpen: () => void;
}

export function HintsBox({ hints, opened, onOpen }: HintsBoxProps) {
  return (
    <section className={styles.section} aria-labelledby="dicas">
      <h3 id="dicas" className={styles.heading}>
        Dicas <span className={styles.count}>{opened} de {hints.length}</span>
      </h3>
      {hints.slice(0, opened).map((hint) => (
        <p key={hint} className={styles.tip}>
          {hint}
        </p>
      ))}
      {opened < hints.length ? (
        <div>
          <Button onClick={onOpen}>{opened === 0 ? 'Ver a primeira dica' : 'Ver a próxima dica'}</Button>
        </div>
      ) : null}
    </section>
  );
}

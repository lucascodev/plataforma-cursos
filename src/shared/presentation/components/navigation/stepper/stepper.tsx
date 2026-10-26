import hidden from '../../../styles/visually-hidden.module.css';
import styles from './stepper.module.css';

interface StepperProps {
  readonly label: string;
  readonly steps: readonly string[];
  /** Zero-based index of the current step. */
  readonly current: number;
}

export function Stepper({ label, steps, current }: StepperProps) {
  return (
    <ol className={styles.stepper} aria-label={label}>
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'upcoming';
        return (
          <li key={step} className={`${styles.step} ${styles[state]}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={styles.label}>{step}</span>
            {state === 'done' ? <span className={hidden.visuallyHidden}> (feito)</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

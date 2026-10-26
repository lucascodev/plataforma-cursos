import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import styles from './plan-box.module.css';

interface PlanBoxProps {
  readonly startDate: DateKey;
  readonly studyDaysLabel: string;
  readonly rangeLabel: string;
  readonly action: 'loading' | 'sign-in' | 'start' | 'continue';
  readonly startPath: string;
  readonly todayPath: string;
  readonly onStartDateChange: (date: DateKey) => void;
  readonly onSignIn: () => void;
}

export function PlanBox({ startDate, studyDaysLabel, rangeLabel, action, startPath, todayPath, onStartDateChange, onSignIn }: PlanBoxProps) {
  if (action === 'continue') {
    return (
      <aside className={styles.box} aria-label="Seu plano">
        <p className={styles.title}>Você já está estudando este curso</p>
        <Link className={styles.primary} to={todayPath}>
          Continuar de onde parei
        </Link>
      </aside>
    );
  }

  return (
    <aside className={styles.box} aria-label="Começar o curso">
      <p className={styles.title}>Monte o seu plano</p>
      <label className={styles.field}>
        Quando você quer começar?
        <input type="date" value={startDate} required onChange={(event) => event.target.value && onStartDateChange(event.target.value as DateKey)} />
      </label>
      <p className={styles.summary} aria-live="polite">
        <span className={styles.summaryLabel}>Seu plano</span>
        <span className={styles.days}>{studyDaysLabel}</span>
        <span className={styles.range}>{rangeLabel}</span>
      </p>
      {action === 'start' ? (
        <Link className={styles.primary} to={startPath}>
          Começar o curso
        </Link>
      ) : (
        <>
          <Button tone="primary" size="lg" disabled={action === 'loading'} onClick={onSignIn}>
            Entrar com GitHub para começar
          </Button>
          <p className={styles.note}>O plano, o progresso e o diário ficam salvos na sua conta e aparecem em qualquer aparelho.</p>
        </>
      )}
    </aside>
  );
}

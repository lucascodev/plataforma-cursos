import type { OverviewView } from '../../types/overview-view.type';
import styles from './progress-overview.module.css';
import { PlanCurve } from './components/plan-curve/plan-curve';

interface ProgressOverviewProps {
  overview: OverviewView;
}

export function ProgressOverview({ overview }: ProgressOverviewProps) {
  return (
    <div className={styles.overview}>
      <div className={styles.numbers}>
        <p className={styles.percent}>
          {overview.percent}
          <span>%</span>
        </p>
        <p className={styles.label}>do curso concluído</p>
        {overview.currentModuleLabel ? <p className={styles.current}>Agora: {overview.currentModuleLabel}</p> : null}
        <p className={overview.paceTone === 'behind' ? `${styles.pace} ${styles.behind}` : styles.pace}>{overview.paceText}</p>
      </div>
      <PlanCurve curve={overview.curve} />
    </div>
  );
}

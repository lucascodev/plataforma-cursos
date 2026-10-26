import type { PlanStatView } from '../../../../types/plan/plan-stat-view.type';
import styles from './plan-stats.module.css';

interface PlanStatsProps {
  stats: readonly PlanStatView[];
}

export function PlanStats({ stats }: PlanStatsProps) {
  return (
    <ul className={styles.stats}>
      {stats.map((stat) => (
        <li key={stat.text} className={stat.warning ? `${styles.stat} ${styles.warning}` : styles.stat}>
          {stat.text}
        </li>
      ))}
    </ul>
  );
}

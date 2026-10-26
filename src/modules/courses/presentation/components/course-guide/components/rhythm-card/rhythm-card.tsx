import type { RhythmView } from '../../../../types/rhythm-view.type';
import styles from './rhythm-card.module.css';

interface RhythmCardProps {
  rhythm: RhythmView;
}

export function RhythmCard({ rhythm }: RhythmCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>Ritmo da semana</h3>
      <p className={styles.total}>
        {rhythm.weeklyHours} h <span>por semana</span>
      </p>
      <svg className={styles.chart} viewBox={`0 0 ${rhythm.width} ${rhythm.height}`} role="img" aria-label={rhythm.summary}>
        {rhythm.bars.map((bar) => (
          <g key={bar.label}>
            <rect className={bar.isLong ? `${styles.bar} ${styles.long}` : styles.bar} x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx={3} />
            <text className={styles.value} x={bar.x + bar.width / 2} y={bar.y - 4} textAnchor="middle">
              {bar.hours}
            </text>
            <text className={styles.label} x={bar.x + bar.width / 2} y={rhythm.height - 4} textAnchor="middle">
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
      <p className={styles.summary}>{rhythm.summary}</p>
    </article>
  );
}

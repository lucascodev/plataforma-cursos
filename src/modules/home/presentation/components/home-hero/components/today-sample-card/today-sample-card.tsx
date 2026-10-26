import type { TodaySampleView } from '../../../../types/today-sample-view.type';
import styles from './today-sample-card.module.css';

export function TodaySampleCard({ sample }: { readonly sample: TodaySampleView }) {
  return (
    <figure className={styles.sample} aria-label="Exemplo de um dia de estudo">
      <div className={styles.card}>
        <div className={styles.meta}>
          <span>{sample.dateLabel}</span>
          <span>{sample.hoursLabel}</span>
        </div>
        <p className={styles.course}>{sample.courseLabel}</p>
        <p className={styles.title}>{sample.title}</p>
        <p className={styles.detail}>{sample.detail}</p>
        <span className={styles.fakeButton} aria-hidden="true">
          Marcar dia como feito
        </span>
      </div>
      <ol className={styles.week} aria-label="Próximos dias">
        {sample.week.map((day) => (
          <li key={day.key} className={day.isToday ? styles.today : undefined}>
            <span>{day.weekday}</span>
            <span className={styles.day}>{day.day}</span>
          </li>
        ))}
      </ol>
      <figcaption className={styles.caption}>{sample.rhythmText}</figcaption>
    </figure>
  );
}

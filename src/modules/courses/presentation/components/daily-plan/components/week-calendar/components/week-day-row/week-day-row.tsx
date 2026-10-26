import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { WeekDayView } from '../../../../../../types/week-day-view.type';
import { ItemCheck } from '../../../../../item-check/item-check';
import { JournalField } from '../../../journal-field/journal-field';
import styles from './week-day-row.module.css';

interface WeekDayRowProps {
  day: WeekDayView;
  onDayDoneChange: (date: DateKey, done: boolean) => void;
  onItemDoneChange: (itemId: string, done: boolean) => void;
  onJournalChange: (date: DateKey, text: string) => void;
}

export function WeekDayRow({ day, onDayDoneChange, onItemDoneChange, onJournalChange }: WeekDayRowProps) {
  const rowClass = [styles.row, day.isToday ? styles.today : '', day.isLate ? styles.late : '', day.isDone ? styles.done : '']
    .filter(Boolean)
    .join(' ');

  if (!day.inPlan) {
    return (
      <li className={`${rowClass} ${styles.outside}`}>
        <span className={styles.date}>
          {day.weekdayShort} {day.dayMonth}
        </span>
        <span className={styles.title}>{day.title}</span>
      </li>
    );
  }

  const { itemId, itemLabel } = day;
  return (
    <li className={rowClass}>
      <input
        type="checkbox"
        className={styles.toggle}
        checked={day.isDone}
        aria-label={`Marcar ${day.weekdayLong} ${day.dayMonth} como feito`}
        onChange={(event) => onDayDoneChange(day.date, event.target.checked)}
      />
      <details className={styles.details}>
        <summary className={styles.summary}>
          <span className={styles.date}>
            {day.weekdayShort} {day.dayMonth}
          </span>
          <span className={styles.title}>{day.title}</span>
          <span className={styles.hours}>{day.hours} h</span>
          {day.isLate ? <span className={styles.badge}>atrasado</span> : null}
        </summary>
        <div className={styles.body}>
          <p className={styles.reference}>{day.reference}</p>
          <p className={styles.detail}>{day.detail}</p>
          {itemId && itemLabel ? <ItemCheck label={itemLabel} checked={day.isItemDone} onChange={(done) => onItemDoneChange(itemId, done)} /> : null}
          <JournalField value={day.journalText} onChange={(text) => onJournalChange(day.date, text)} />
        </div>
      </details>
    </li>
  );
}

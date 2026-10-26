import { Button } from '@/shared/presentation/components/actions/button/button';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { TodayView } from '../../../../types/today-view.type';
import { ItemCheck } from '../../../item-check/item-check';
import { JournalField } from '../journal-field/journal-field';
import styles from './today-card.module.css';

interface TodayCardProps {
  today: TodayView;
  onDayDoneChange: (date: DateKey, done: boolean) => void;
  onItemDoneChange: (itemId: string, done: boolean) => void;
  onJournalChange: (date: DateKey, text: string) => void;
}

export function TodayCard({ today, onDayDoneChange, onItemDoneChange, onJournalChange }: TodayCardProps) {
  const { itemId, itemLabel } = today;
  return (
    <article className={today.isDone ? `${styles.card} ${styles.done}` : styles.card} aria-labelledby="today-title">
      <div className={styles.meta}>
        <span className={styles.kicker}>{today.kicker}</span>
        <span>{today.hoursLabel}</span>
      </div>
      <p className={styles.reference}>{today.reference}</p>
      <h3 id="today-title" className={styles.title}>
        {today.title}
      </h3>
      <p className={styles.detail}>{today.detail}</p>
      <div className={styles.actions}>
        <Button tone={today.isDone ? 'default' : 'primary'} aria-pressed={today.isDone} onClick={() => onDayDoneChange(today.date, !today.isDone)}>
          {today.isDone ? 'Dia feito ✓' : 'Marcar dia como feito'}
        </Button>
        {itemId && itemLabel ? <ItemCheck label={itemLabel} checked={today.isItemDone} onChange={(done) => onItemDoneChange(itemId, done)} /> : null}
      </div>
      <JournalField value={today.journalText} onChange={(text) => onJournalChange(today.date, text)} />
      {today.next ? (
        <p className={styles.next}>
          Próximo: <strong>{today.next.title}</strong> · {today.next.when}
        </p>
      ) : null}
      {today.hint ? <p className={styles.hint}>{today.hint}</p> : null}
    </article>
  );
}

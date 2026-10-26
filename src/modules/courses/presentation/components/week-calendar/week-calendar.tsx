import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { WeekView } from '../../types/plan/week-view.type';
import styles from './week-calendar.module.css';
import { WeekDayRow } from './components/week-day-row/week-day-row';

interface WeekCalendarProps {
  week: WeekView;
  onDayDoneChange: (date: DateKey, done: boolean) => void;
  onItemDoneChange: (itemId: string, done: boolean) => void;
  onJournalChange: (date: DateKey, text: string) => void;
}

export function WeekCalendar({ week, onDayDoneChange, onItemDoneChange, onJournalChange }: WeekCalendarProps) {
  return (
    <section className={styles.calendar} aria-label="Semana do plano">
      <div className={styles.toolbar}>
        <Button onClick={week.goBack} disabled={!week.canGoBack} aria-label="Semana anterior">
          <ChevronLeft size={18} aria-hidden="true" />
        </Button>
        <p className={styles.label} aria-live="polite">
          {week.label}
        </p>
        <Button onClick={week.goForward} disabled={!week.canGoForward} aria-label="Próxima semana">
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
        <Button onClick={week.goToCurrent}>Esta semana</Button>
      </div>
      <ol className={styles.days}>
        {week.days.map((day) => (
          <WeekDayRow
            key={day.date}
            day={day}
            onDayDoneChange={onDayDoneChange}
            onItemDoneChange={onItemDoneChange}
            onJournalChange={onJournalChange}
          />
        ))}
      </ol>
    </section>
  );
}

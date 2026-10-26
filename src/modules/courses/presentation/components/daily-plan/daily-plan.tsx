import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { PlanStatView } from '../../types/plan-stat-view.type';
import type { TodayView } from '../../types/today-view.type';
import type { WeekView } from '../../types/week-view.type';
import styles from './daily-plan.module.css';
import { PlanStats } from './components/plan-stats/plan-stats';
import { TodayCard } from './components/today-card/today-card';
import { WeekCalendar } from './components/week-calendar/week-calendar';

interface DailyPlanProps {
  today: TodayView | null;
  week: WeekView;
  stats: readonly PlanStatView[];
  onDayDoneChange: (date: DateKey, done: boolean) => void;
  onItemDoneChange: (itemId: string, done: boolean) => void;
  onJournalChange: (date: DateKey, text: string) => void;
}

export function DailyPlan({ today, week, stats, onDayDoneChange, onItemDoneChange, onJournalChange }: DailyPlanProps) {
  return (
    <div className={styles.plan}>
      {today ? <TodayCard today={today} onDayDoneChange={onDayDoneChange} onItemDoneChange={onItemDoneChange} onJournalChange={onJournalChange} /> : null}
      <WeekCalendar week={week} onDayDoneChange={onDayDoneChange} onItemDoneChange={onItemDoneChange} onJournalChange={onJournalChange} />
      <PlanStats stats={stats} />
    </div>
  );
}

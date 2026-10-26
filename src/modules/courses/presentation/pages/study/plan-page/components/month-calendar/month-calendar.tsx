import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { StudyDayStatus } from '../../../../../../domain/types/study-day-status.type';
import styles from './month-calendar.module.css';

interface MonthCell {
  readonly date: DateKey;
  readonly inMonth: boolean;
  readonly isSelected: boolean;
  readonly info: { readonly day: number; readonly title: string; readonly status: StudyDayStatus; readonly statusLabel: string } | null;
}

interface MonthCalendarProps {
  readonly weekdayLabels: readonly string[];
  readonly weeks: readonly (readonly MonthCell[])[];
  readonly onSelect: (date: DateKey) => void;
}

export function MonthCalendar({ weekdayLabels, weeks, onSelect }: MonthCalendarProps) {
  return (
    <table className={styles.calendar}>
      <thead>
        <tr>
          {weekdayLabels.map((label) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]?.date}>
            {week.map((cell) => (
              <td key={cell.date} className={cell.inMonth ? undefined : styles.outside}>
                {cell.info ? (
                  <button
                    type="button"
                    className={cell.isSelected ? `${styles.cell} ${styles.selected}` : styles.cell}
                    aria-pressed={cell.isSelected}
                    aria-label={`${cell.info.day}: ${cell.info.title}, ${cell.info.statusLabel}`}
                    onClick={() => onSelect(cell.date)}
                  >
                    <span className={styles.head}>
                      <span>{cell.info.day}</span>
                      <span className={`${styles.dot} ${styles[cell.info.status]}`} aria-hidden="true" />
                    </span>
                    <span className={styles.title}>{cell.info.title}</span>
                  </button>
                ) : (
                  <span className={styles.empty}>{cell.inMonth ? Number(cell.date.slice(8)) : ''}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { StudyDayStatus } from '../../types/study-day-status.type';

export function studyDayStatus(date: DateKey, isDone: boolean, today: DateKey): StudyDayStatus {
  if (isDone) return 'done';
  if (date === today) return 'today';
  return date < today ? 'late' : 'upcoming';
}

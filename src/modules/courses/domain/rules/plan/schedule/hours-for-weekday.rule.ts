import type { StudyRhythm } from '../../../entities/course/study-rhythm.entity';

export function hoursForWeekday(weekday: number, rhythm: StudyRhythm): number {
  if (weekday === 0) return rhythm.sundayHours;
  if (weekday === 6) return rhythm.saturdayHours;
  return rhythm.weekdayHours;
}

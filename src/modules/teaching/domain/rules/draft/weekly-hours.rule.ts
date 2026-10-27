import type { EditableCourse } from '../../entities/draft/editable-course.entity';

const WEEKDAYS = 5;

export function weeklyHours(rhythm: EditableCourse['rhythm']): number {
  return rhythm.weekdayHours * WEEKDAYS + rhythm.saturdayHours + rhythm.sundayHours;
}

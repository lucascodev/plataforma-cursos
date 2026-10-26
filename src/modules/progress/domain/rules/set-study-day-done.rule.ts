import type { DateKey } from '@/shared/domain/types/date-key.type';
import type { CourseProgress } from '../entities/course-progress.entity';
import { setFlag } from './set-flag.rule';

export function setStudyDayDone(progress: CourseProgress, date: DateKey, done: boolean): CourseProgress {
  return { ...progress, studyDays: setFlag(progress.studyDays, date, done) };
}

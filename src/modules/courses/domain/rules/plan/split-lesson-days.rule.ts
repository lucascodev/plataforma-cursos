import { planTuning } from '../../constants/plan-tuning';

export function splitLessonDays(dayCount: number): { study: number; exercise: number; review: number } {
  const review = dayCount >= planTuning.reviewThreshold ? 1 : 0;
  const study = Math.max(1, Math.round(dayCount * planTuning.studyShare));
  const exercise = Math.max(0, dayCount - study - review);
  return { study, exercise, review };
}

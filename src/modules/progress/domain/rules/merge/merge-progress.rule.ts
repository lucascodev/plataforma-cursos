import type { CourseProgress } from '../../entities/course-progress.entity';
import { mergeRecord } from './merge-record.rule';
import { mergeValue } from './merge-value.rule';

// base: what this tab last loaded or saved. local: this tab now. remote: what another tab or device saved meanwhile.
export function mergeProgress(base: CourseProgress, local: CourseProgress, remote: CourseProgress): CourseProgress {
  const changedStart = local.startDate !== base.startDate || local.startDateSource !== base.startDateSource;
  return {
    completedItems: mergeRecord(base.completedItems, local.completedItems, remote.completedItems),
    studyDays: mergeRecord(base.studyDays, local.studyDays, remote.studyDays),
    moduleNotes: mergeRecord(base.moduleNotes, local.moduleNotes, remote.moduleNotes),
    journal: mergeRecord(base.journal, local.journal, remote.journal),
    projectChecks: mergeRecord(base.projectChecks, local.projectChecks, remote.projectChecks),
    projectDeliveries: mergeRecord(base.projectDeliveries, local.projectDeliveries, remote.projectDeliveries),
    exercises: mergeRecord(base.exercises, local.exercises, remote.exercises),
    startDate: changedStart ? local.startDate : remote.startDate,
    startDateSource: changedStart ? local.startDateSource : remote.startDateSource,
    updatedAt: mergeValue(base.updatedAt, local.updatedAt, remote.updatedAt),
  };
}

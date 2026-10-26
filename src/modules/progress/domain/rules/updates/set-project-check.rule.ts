import type { CourseProgress } from '../../entities/course-progress.entity';
import type { ProjectChecks } from '../../entities/project-checks.entity';
import type { ProjectCheckKind } from '../../types/project-check-kind.type';
import { setFlag } from './set-flag.rule';

const NO_CHECKS: ProjectChecks = { requirements: {}, criteria: {} };

export function setProjectCheck(progress: CourseProgress, moduleId: string, kind: ProjectCheckKind, checkId: string, checked: boolean): CourseProgress {
  const current = progress.projectChecks[moduleId] ?? NO_CHECKS;
  const flags = setFlag(current[kind], checkId, checked);
  if (flags === current[kind]) return progress;
  return { ...progress, projectChecks: { ...progress.projectChecks, [moduleId]: { ...current, [kind]: flags } } };
}

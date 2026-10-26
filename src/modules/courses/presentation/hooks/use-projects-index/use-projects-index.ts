import { deliversProject } from '../../../domain/rules/module/delivers-project.rule';
import type { StudyContext } from '../../types/study/study-context.type';

// The projects tab opens on the first project not handed in yet, or on the last one when all are done.
export function useProjectsIndex({ details, progressState, study }: StudyContext): string {
  const projects = study.modules.filter((module) => deliversProject(module.kind));
  const next = projects.find((module) => !progressState.progress?.projectDeliveries[module.id]) ?? projects.at(-1);
  return next ? `/cursos/${details.course.slug}/projetos/${next.id}` : `/cursos/${details.course.slug}/hoje`;
}

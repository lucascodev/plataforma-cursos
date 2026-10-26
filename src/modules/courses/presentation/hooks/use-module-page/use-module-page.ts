import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { deliversProject } from '../../../domain/rules/module/delivers-project.rule';
import { moduleCode } from '../../../domain/rules/module/module-code.rule';
import type { StudyContext } from '../../types/study/study-context.type';

export function useModulePage({ details, progressState, study }: StudyContext, moduleId: string) {
  const slug = details.course.slug;
  const index = study.modules.findIndex((module) => module.id === moduleId);
  const module = study.modules[index];
  const range = study.plan.moduleRanges.get(index);

  return {
    module: module ?? null,
    fallbackPath: `/cursos/${slug}/modulos/${study.currentModuleId ?? study.modules[0]?.id ?? ''}`,
    kicker: module
      ? `Módulo ${module.number}${range && deliversProject(module.kind) ? ` · ${formatDayMonthYear(range.first)} a ${formatDayMonthYear(range.last)}` : ' · aos domingos'}`
      : '',
    projectPath: module && deliversProject(module.kind) ? `/cursos/${slug}/projetos/${moduleId}` : null,
    chips: study.modules.map((entry, position) => ({
      id: entry.id,
      code: moduleCode(position),
      title: entry.shortTitle,
      to: `/cursos/${slug}/modulos/${entry.id}`,
      isActive: entry.id === moduleId,
      isComplete: entry.isComplete,
    })),
    setItemCompleted: progressState.actions.setItemCompleted,
    setNote: (text: string) => progressState.actions.setModuleNote(moduleId, text),
  };
}

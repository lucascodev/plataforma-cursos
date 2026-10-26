import { useState } from 'react';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { formatDayMonth } from '@/shared/utils/date/format/format-day-month';
import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { pluralize } from '@/shared/utils/text/pluralize';
import { projectDeliverySchema } from '@contracts/progress/project-delivery.schema';
import { deliversProject } from '../../../domain/rules/module/delivers-project.rule';
import { moduleCode } from '../../../domain/rules/module/module-code.rule';
import { projectStages } from '../../../domain/rules/plan/project-stages.rule';
import { PROJECT_STAGE_LABELS } from '../../constants/project-stage-labels';
import type { StudyContext } from '../../types/study/study-context.type';

const describeRange = (first: string, last: string) => (first === last ? formatDayMonth(first) : `${formatDayMonth(first)} a ${formatDayMonth(last)}`);

export function useProjectPage({ details, progressState, study }: StudyContext, moduleId: string) {
  const { course } = details;
  const progress = progressState.progress;
  const moduleIndex = study.modules.findIndex((module) => module.id === moduleId);
  const module = study.modules[moduleIndex];
  const delivery = progress?.projectDeliveries[moduleId] ?? null;
  const checks = progress?.projectChecks[moduleId];

  const [repoUrl, setRepoUrl] = useState(delivery?.repoUrl ?? '');
  const [demoUrl, setDemoUrl] = useState(delivery?.demoUrl ?? '');
  const [metrics, setMetrics] = useState(delivery?.metrics ?? '');
  const [hasTriedRepo, setHasTriedRepo] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const projectModules = study.modules.filter((entry) => deliversProject(entry.kind));
  const stages = projectStages(study.plan, moduleIndex);
  const firstStage = stages[0];
  const lastStage = stages.at(-1);

  const requirements = (module?.project.requirements ?? []).map((text, index) => ({ id: `r${index}`, text, checked: Boolean(checks?.requirements[`r${index}`]) }));
  const criteria = (module?.project.doneCriteria ?? []).map((text, index) => ({ id: `c${index}`, text, checked: Boolean(checks?.criteria[`c${index}`]) }));
  const candidate = { repoUrl: repoUrl.trim(), demoUrl: demoUrl.trim() || null, metrics, deliveredAt: makeClock().now().toISOString() };
  const parsed = projectDeliverySchema.safeParse(candidate);
  const repoError = parsed.success ? null : (parsed.error.issues.find((issue) => issue.path[0] === 'repoUrl')?.message ?? null);
  const demoError = parsed.success ? null : (parsed.error.issues.find((issue) => issue.path[0] === 'demoUrl')?.message ?? null);
  const allCriteriaChecked = criteria.length > 0 && criteria.every((criterion) => criterion.checked);
  const deliveredCount = projectModules.filter((entry) => progress?.projectDeliveries[entry.id]).length;

  return {
    module: module ?? null,
    fallbackPath: `/cursos/${course.slug}/projetos`,
    modulePath: `/cursos/${course.slug}/modulos/${moduleId}`,
    kicker: firstStage && lastStage ? `Projeto do módulo ${moduleIndex + 1} · ${describeRange(firstStage.firstDate, lastStage.lastDate)} ${lastStage.lastDate.slice(0, 4)}` : `Projeto do módulo ${moduleIndex + 1}`,
    portfolio: `${deliveredCount} de ${projectModules.length} projetos entregues`,
    strip: projectModules.map((entry) => {
      const entryStages = projectStages(study.plan, study.modules.indexOf(entry));
      const start = entryStages[0]?.firstDate;
      const isDelivered = Boolean(progress?.projectDeliveries[entry.id]);
      return {
        id: entry.id,
        to: `/cursos/${course.slug}/projetos/${entry.id}`,
        code: moduleCode(entry.number - 1),
        title: entry.project.title,
        status: isDelivered ? 'entregue' : start && start > study.today ? `começa ${formatDayMonth(start)}` : 'em andamento',
        isActive: entry.id === moduleId,
        isDelivered,
      };
    }),
    stages: stages.map((stage, index) => ({
      kind: stage.kind,
      title: `${index + 1}. ${PROJECT_STAGE_LABELS[stage.kind].title}`,
      hint: PROJECT_STAGE_LABELS[stage.kind].hint,
      when: `${describeRange(stage.firstDate, stage.lastDate)} · ${pluralize(stage.days, 'dia', 'dias')}`,
    })),
    requirements,
    criteria,
    requirementsCount: `${requirements.filter((item) => item.checked).length} de ${requirements.length}`,
    criteriaCount: `${criteria.filter((item) => item.checked).length} de ${criteria.length}`,
    toggleCheck: (kind: 'requirements' | 'criteria', checkId: string, checked: boolean) => progressState.actions.setProjectCheck(moduleId, kind, checkId, checked),
    form: {
      repoUrl,
      demoUrl,
      metrics,
      repoError: hasTriedRepo ? repoError : null,
      demoError: demoUrl.trim() ? demoError : null,
      setRepoUrl,
      setDemoUrl,
      setMetrics,
      touchRepo: () => setHasTriedRepo(true),
    },
    delivery: delivery ? { repoUrl: delivery.repoUrl, deliveredOn: formatDayMonthYear(delivery.deliveredAt.slice(0, 10)) } : null,
    canDeliver: allCriteriaChecked && parsed.success,
    deliverHint: allCriteriaChecked ? (parsed.success ? null : 'Informe o endereço https do repositório público.') : 'Marque todos os itens de "Pronto quando" para entregar.',
    deliver: () => {
      setHasTriedRepo(true);
      if (!parsed.success || !allCriteriaChecked || !module) return;
      progressState.actions.deliverProject(moduleId, module.project.itemId, parsed.data);
      setIsCelebrating(true);
    },
    celebration: {
      isOpen: isCelebrating,
      title: `${module?.project.title ?? 'Projeto'} entregue`,
      count: `Projeto ${deliveredCount} de ${projectModules.length} entregue`,
      close: () => setIsCelebrating(false),
    },
  };
}

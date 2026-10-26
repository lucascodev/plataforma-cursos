import type { ProjectStage } from '../../entities/plan/project-stage.entity';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';

const STAGE_ORDER: readonly ProjectStage['kind'][] = ['project-plan', 'project-build', 'project-evaluate', 'project-publish'];

export function projectStages(plan: StudyPlan, moduleIndex: number): ProjectStage[] {
  return STAGE_ORDER.flatMap((kind) => {
    const days = plan.days.filter((day) => day.moduleIndex === moduleIndex && day.kind === kind);
    const first = days[0];
    const last = days.at(-1);
    return first && last ? [{ kind, firstDate: first.date, lastDate: last.date, days: days.length }] : [];
  });
}

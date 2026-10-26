import { BuildStudyPlanUseCase } from '../../application/use-cases/build-study-plan.use-case';

export function makeBuildStudyPlan(): BuildStudyPlanUseCase {
  return new BuildStudyPlanUseCase();
}

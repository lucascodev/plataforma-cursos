import type { StudyPlan } from '../../domain/entities/plan/study-plan.entity';
import { buildStudyPlan } from '../../domain/rules/plan/build-study-plan.rule';
import type { BuildStudyPlanInputDto } from '../dtos/build-study-plan/build-study-plan-input.dto';

export class BuildStudyPlanUseCase {
  execute(input: BuildStudyPlanInputDto): StudyPlan {
    return buildStudyPlan(input.course, input.startDate);
  }
}

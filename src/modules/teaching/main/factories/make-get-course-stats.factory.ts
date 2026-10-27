import { GetCourseStatsUseCase } from '../../application/use-cases/get-course-stats.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeGetCourseStats(): GetCourseStatsUseCase {
  return new GetCourseStatsUseCase(makeTeachingGateway());
}

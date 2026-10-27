import type { CourseStats } from '../../domain/entities/course-stats.entity';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class GetCourseStatsUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(slug: string): Promise<CourseStats> {
    return this.teachingGateway.getStats(slug);
  }
}

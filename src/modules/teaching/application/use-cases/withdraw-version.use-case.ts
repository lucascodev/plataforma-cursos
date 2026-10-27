import type { CourseVersion } from '../../domain/entities/versions/course-version.entity';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class WithdrawVersionUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(slug: string, versionId: string): Promise<CourseVersion> {
    return this.teachingGateway.withdrawVersion(slug, versionId);
  }
}

import type { CourseWorkspace } from '../../domain/entities/course-workspace.entity';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class GetCourseWorkspaceUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(slug: string): Promise<CourseWorkspace | null> {
    return this.teachingGateway.getWorkspace(slug);
  }
}

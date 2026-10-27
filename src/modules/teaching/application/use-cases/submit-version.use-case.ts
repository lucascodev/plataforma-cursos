import type { CourseVersion } from '../../domain/entities/versions/course-version.entity';
import type { SubmitVersionInputDto } from '../dtos/submit-version-input.dto';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class SubmitVersionUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(input: SubmitVersionInputDto): Promise<CourseVersion> {
    return this.teachingGateway.submitVersion({ ...input, message: input.message.trim() });
  }
}

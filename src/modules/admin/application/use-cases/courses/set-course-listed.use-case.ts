import type { SetCourseListedInputDto } from '../../dtos/set-course-listed-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class SetCourseListedUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: SetCourseListedInputDto): Promise<void> {
    return this.adminGateway.setCourseListed(input.listed ? { ...input, reason: null, note: '' } : { ...input, note: input.note.trim() });
  }
}

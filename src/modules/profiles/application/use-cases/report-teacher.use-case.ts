import type { ReportTeacherInputDto } from '../dtos/report-teacher-input.dto';
import type { ProfileGateway } from '../ports/profile-gateway.interface';

export class ReportTeacherUseCase {
  constructor(private readonly profileGateway: ProfileGateway) {}

  execute(input: ReportTeacherInputDto): Promise<void> {
    return this.profileGateway.reportTeacher({ ...input, details: input.details.trim() });
  }
}

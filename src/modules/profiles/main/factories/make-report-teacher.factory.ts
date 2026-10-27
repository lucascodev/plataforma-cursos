import { ReportTeacherUseCase } from '../../application/use-cases/report-teacher.use-case';
import { makeProfileGateway } from './make-profile-gateway.factory';

export function makeReportTeacher(): ReportTeacherUseCase {
  return new ReportTeacherUseCase(makeProfileGateway());
}

import { useMutation } from '@tanstack/react-query';
import type { ReportTeacherInputDto } from '../../../application/dtos/report-teacher-input.dto';
import { makeReportTeacher } from '../../../main/factories/make-report-teacher.factory';

export function useReportTeacherMutation() {
  return useMutation({ mutationFn: (input: ReportTeacherInputDto) => makeReportTeacher().execute(input) });
}

import type { CourseSummaryOutputDto } from '@/modules/courses';

export function describeRhythm({ weekdayHours, saturdayHours, sundayHours }: CourseSummaryOutputDto['rhythm']): string {
  const sunday = sundayHours > 0 ? ` e ${sundayHours} h de atividade leve no domingo` : '';
  return `${weekdayHours} h de segunda a sexta, sessão longa de ${saturdayHours} h no sábado${sunday}.`;
}

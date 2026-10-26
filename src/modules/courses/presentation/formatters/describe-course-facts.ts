import { pluralize } from '@/shared/utils/text/pluralize';
import type { CourseTotals } from '../../domain/entities/summary/course-totals.entity';

export function describeCourseFacts(totals: CourseTotals): string[] {
  return [
    pluralize(totals.modules, 'módulo', 'módulos'),
    pluralize(totals.lessons, 'aula', 'aulas'),
    pluralize(totals.drills, 'exercício de fixação', 'exercícios de fixação'),
    `${pluralize(totals.projects, 'projeto', 'projetos')}${totals.hasCapstone ? ' + projeto de conclusão' : ''}`,
    `≈ ${Math.round(totals.months)} meses`,
    `≈ ${totals.hours} h`,
    `${totals.weeklyHours} h por semana`,
  ];
}

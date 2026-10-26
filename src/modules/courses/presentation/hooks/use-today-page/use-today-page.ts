import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { pluralize } from '@/shared/utils/text/pluralize';
import { moduleCode } from '../../../domain/rules/module/module-code.rule';
import { describeTodayHeading } from '../../formatters/describe-today-heading';
import type { StudyContext } from '../../types/study/study-context.type';

export function useTodayPage({ details, study }: StudyContext) {
  const slug = details.course.slug;
  const currentModule = study.modules.find((module) => module.id === study.currentModuleId);
  const dateLabel = formatFullDate(study.today);

  return {
    dateLine: `${dateLabel.charAt(0).toUpperCase()}${dateLabel.slice(1)} · semana ${study.week.week} de ${study.week.totalWeeks}`,
    heading: study.todayView ? describeTodayHeading(study.todayView.kind) : 'Plano de estudo',
    pace: { text: study.overview.paceText, isBehind: study.overview.paceTone === 'behind' },
    stats: [
      {
        label: 'Agora',
        value: currentModule ? `${moduleCode(currentModule.number - 1)} · ${currentModule.shortTitle}` : '—',
        hint: currentModule ? `${currentModule.completed} de ${currentModule.total} itens` : '',
        link: null,
      },
      { label: 'Sequência', value: pluralize(study.days.streak, 'dia', 'dias'), hint: 'seguidos de estudo', link: null },
      { label: 'Dias feitos', value: String(study.days.completed), hint: `desde ${formatDayMonthYear(study.startDate)}`, link: null },
      {
        label: 'Em atraso',
        value: pluralize(study.days.late, 'dia', 'dias'),
        hint: study.oldestOverdueDate ? `desde ${formatFullDate(study.oldestOverdueDate)}` : 'nenhum',
        link: study.oldestOverdueDate ? `/cursos/${slug}/plano` : null,
      },
    ],
    dayPath: study.todayView ? `/cursos/${slug}/dia/${study.todayView.date}` : null,
    moduleCards: study.modules.map((module) => ({
      id: module.id,
      to: `/cursos/${slug}/modulos/${module.id}`,
      code: moduleCode(module.number - 1),
      title: module.shortTitle,
      completed: module.completed,
      total: module.total,
      isCurrent: module.isCurrent,
    })),
  };
}

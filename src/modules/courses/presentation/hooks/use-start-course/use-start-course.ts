import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import type { CourseProgressState } from '@/modules/progress';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { makeFileDownloader } from '@/shared/main/factories/make-file-downloader.factory';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { pluralize } from '@/shared/utils/text/pluralize';
import { isDateKey } from '@contracts/date/is-date-key';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { buildStudyCalendar } from '../../../domain/rules/calendar/build-study-calendar.rule';
import { planSpan } from '../../../domain/rules/plan/plan-span.rule';
import { suggestStartDate } from '../../../domain/rules/plan/schedule/suggest-start-date.rule';
import { makeBuildStudyPlan } from '../../../main/factories/make-build-study-plan.factory';

type StartChoice = 'today' | 'monday' | 'custom';

const ICS_MIME_TYPE = 'text/calendar;charset=utf-8';

const toIcsStamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function useStartCourse({ course }: CourseDetailsOutputDto, progressState: CourseProgressState) {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const clock = makeClock();
  const today = clock.today();
  const nextMonday = suggestStartDate(today);
  const requested = params.get('inicio');
  const initialCustom: DateKey = requested && isDateKey(requested) ? requested : nextMonday;

  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<StartChoice>(requested && initialCustom !== today && initialCustom !== nextMonday ? 'custom' : 'monday');
  const [customDate, setCustomDate] = useState<DateKey>(initialCustom);
  const [wantsCalendar, setWantsCalendar] = useState(true);

  const startDate = choice === 'today' ? today : choice === 'monday' ? nextMonday : customDate;
  const span = useMemo(() => planSpan(makeBuildStudyPlan().execute({ course, startDate })), [course, startDate]);
  const coursePath = `/cursos/${course.slug}`;

  const options = [
    { value: 'today', title: 'Hoje', description: formatFullDate(today) },
    ...(nextMonday === today ? [] : [{ value: 'monday', title: 'Próxima segunda', description: formatFullDate(nextMonday) }]),
    { value: 'custom', title: 'Outra data', description: 'Escolha no calendário' },
  ];

  const start = () => {
    progressState.actions.setStartDate(startDate, 'user');
    if (wantsCalendar) {
      makeFileDownloader().download({
        filename: `${course.slug}-horarios.ics`,
        mimeType: ICS_MIME_TYPE,
        content: buildStudyCalendar({
          courseSlug: course.slug,
          courseTitle: course.title,
          courseUrl: `${window.location.origin}${coursePath}/hoje`,
          startDate,
          endDate: span.lastDate,
          rhythm: course.rhythm,
          stampedAt: toIcsStamp(clock.now()),
        }),
      });
    }
    toast.show({ text: wantsCalendar ? 'Plano criado. Abra o arquivo baixado para pôr os horários na agenda.' : 'Plano criado. Bom estudo!' });
    navigate(`${coursePath}/hoje`);
  };

  return {
    step,
    stepLabels: ['Data de início', 'Ritmo da semana'],
    choice: choice === 'monday' && nextMonday === today ? 'today' : choice,
    customDate,
    options,
    weeklyHours: pluralize(course.rhythm.weekdayHours * 5 + course.rhythm.saturdayHours + course.rhythm.sundayHours, 'hora', 'horas'),
    rhythmItems: [
      { hours: `${course.rhythm.weekdayHours} h`, when: 'Segunda a sexta', what: 'Aula, exercício ou revisão' },
      { hours: `${course.rhythm.saturdayHours} h`, when: 'Sábado', what: 'Sessão longa, boa para o projeto' },
      ...(course.rhythm.sundayHours > 0 ? [{ hours: `${course.rhythm.sundayHours} h`, when: 'Domingo', what: 'Atividade leve' }] : []),
    ],
    wantsCalendar,
    coursePath,
    existingStartLabel: progressState.progress?.startDate ? formatDayMonthYear(progressState.progress.startDate) : null,
    summary: {
      studyDays: pluralize(span.studyDays, 'dia de estudo', 'dias de estudo'),
      range: `De ${formatDayMonthYear(span.firstDate)} a ${formatDayMonthYear(span.lastDate)}`,
    },
    choose: (value: string) => setChoice(value as StartChoice),
    setCustomDate: (value: string) => {
      if (isDateKey(value)) setCustomDate(value);
    },
    setWantsCalendar,
    next: () => setStep(2),
    back: () => setStep(1),
    start,
  };
}

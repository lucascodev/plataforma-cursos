import { useState } from 'react';
import { useBackupActions } from '@/modules/progress';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import { dayOfWeek } from '@/shared/utils/date/calendar/day-of-week';
import { MONTH_SHORT_NAMES } from '@/shared/utils/date/names/month-short-names';
import { WEEKDAY_SHORT_NAMES } from '@/shared/utils/date/names/weekday-short-names';
import { filterJournalEntries } from '../../../domain/rules/journal/filter-journal-entries.rule';
import { listJournalEntries } from '../../../domain/rules/journal/list-journal-entries.rule';
import { moduleCode } from '../../../domain/rules/module/module-code.rule';
import { describeStudyDay } from '../../formatters/describe-study-day';
import type { StudyContext } from '../../types/study/study-context.type';

export function useJournalPage({ details, progressState, study }: StudyContext) {
  const { course } = details;
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [moduleIndex, setModuleIndex] = useState<number | null>(null);
  const backup = useBackupActions({
    courseSlug: course.slug,
    progress: progressState.progress,
    actions: progressState.actions,
    buildJournalExport: study.buildJournalExport,
  });

  const entries = listJournalEntries(progressState.progress?.journal ?? {}, study.plan);
  const visible = filterJournalEntries(entries, query, moduleIndex);
  const moduleIndexes = [...new Set(entries.flatMap((entry) => (entry.moduleIndex === null ? [] : [entry.moduleIndex])))].sort((a, b) => a - b);

  return {
    hasEntries: entries.length > 0,
    query,
    setQuery,
    filters: [
      { key: null, label: 'Todos', isActive: moduleIndex === null },
      ...moduleIndexes.map((index) => ({ key: index, label: moduleCode(index), isActive: moduleIndex === index })),
    ],
    selectModule: setModuleIndex,
    clear: () => {
      setQuery('');
      setModuleIndex(null);
    },
    entries: visible.map((entry) => {
      const [, month = 1, day = 1] = entry.date.split('-').map(Number);
      const studyDay = study.plan.dayByDate.get(entry.date);
      return {
        date: entry.date,
        day,
        meta: `${MONTH_SHORT_NAMES[month - 1] ?? ''} · ${WEEKDAY_SHORT_NAMES[dayOfWeek(entry.date)] ?? ''}`,
        label: studyDay ? describeStudyDay(course, studyDay).title : 'Fora do plano',
        text: entry.text,
      };
    }),
    exportMarkdown: () => {
      backup.exportJournal();
      toast.show({ text: 'Diário salvo na pasta de downloads.' });
    },
    todayPath: `/cursos/${course.slug}/hoje`,
  };
}

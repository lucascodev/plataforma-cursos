import { useState, type ChangeEvent } from 'react';
import { useAuthSession } from '@/modules/auth';
import { useBackupActions } from '@/modules/progress';
import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { pluralize } from '@/shared/utils/text/pluralize';
import type { StudyContext } from '../../types/study/study-context.type';

const countEntries = (record: Readonly<Record<string, unknown>>) => Object.keys(record).length;

export function useDataPage({ details, progressState, study }: StudyContext) {
  const session = useAuthSession();
  const progress = progressState.progress;
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const backup = useBackupActions({
    courseSlug: details.course.slug,
    progress,
    actions: progressState.actions,
    buildJournalExport: study.buildJournalExport,
  });
  const pending = backup.pendingImport;

  return {
    user: session.user,
    message: backup.message,
    exportBackup: backup.exportBackup,
    exportJournal: backup.exportJournal,
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file) backup.readFile(file);
    },
    importPreview: pending
      ? {
          exportedOn: formatDayMonthYear(pending.exportedAt.slice(0, 10)),
          rows: [
            { label: 'Itens concluídos', backup: pending.completedItems, current: countEntries(progress?.completedItems ?? {}) },
            { label: 'Dias feitos', backup: pending.studyDays, current: countEntries(progress?.studyDays ?? {}) },
            { label: 'Dias com diário', backup: pending.journalEntries, current: countEntries(progress?.journal ?? {}) },
          ],
        }
      : null,
    confirmImport: backup.confirmImport,
    cancelImport: backup.cancelImport,
    isConfirmingErase: backup.eraseRequested,
    requestErase: backup.requestErase,
    cancelErase: backup.cancelErase,
    confirmErase: () => void backup.confirmErase(),
    summary: `${pluralize(countEntries(progress?.completedItems ?? {}), 'item concluído', 'itens concluídos')}, ${pluralize(countEntries(progress?.studyDays ?? {}), 'dia feito', 'dias feitos')} e ${pluralize(countEntries(progress?.journal ?? {}), 'dia com diário', 'dias com diário')}`,
    signOut: {
      isConfirming: isConfirmingSignOut,
      ask: () => setIsConfirmingSignOut(true),
      cancel: () => setIsConfirmingSignOut(false),
      confirm: () => {
        setIsConfirmingSignOut(false);
        void session.signOut();
      },
    },
  };
}

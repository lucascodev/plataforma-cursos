import { useState } from 'react';
import type { ReadBackupOutputDto } from '../../../application/dtos/read-backup/read-backup-output.dto';
import type { CourseProgress } from '../../../domain/entities/course-progress.entity';
import { progressLimits } from '@contracts/progress/progress-limits';
import type { JournalExport } from '../../../domain/entities/journal-export.entity';
import { InvalidBackupError } from '../../../domain/errors/invalid-backup.error';
import { makeExportBackup } from '../../../main/factories/backup/make-export-backup.factory';
import { makeExportJournal } from '../../../main/factories/backup/make-export-journal.factory';
import { makeReadBackup } from '../../../main/factories/backup/make-read-backup.factory';
import type { CourseProgressActions } from '../use-course-progress/course-progress-actions.type';
import type { BackupMessage } from './backup-message.type';

interface UseBackupActionsParams {
  courseSlug: string;
  progress: CourseProgress | null;
  actions: CourseProgressActions;
  buildJournalExport: () => JournalExport | null;
}

const BACKUP_ERRORS: Record<InvalidBackupError['reason'], string> = {
  'too-large': 'O arquivo passa de 2 MB. Use o backup exportado por esta página.',
  'not-json': 'Esse arquivo não é um backup válido desta plataforma.',
  'wrong-format': 'Esse arquivo não é um backup válido desta plataforma.',
  'other-course': 'Esse backup é de outro curso.',
};

export function useBackupActions({ courseSlug, progress, actions, buildJournalExport }: UseBackupActionsParams) {
  const [pendingImport, setPendingImport] = useState<ReadBackupOutputDto | null>(null);
  const [eraseRequested, setEraseRequested] = useState(false);
  const [message, setMessage] = useState<BackupMessage | null>(null);

  const readFile = async (file: File) => {
    setMessage(null);
    try {
      const content = file.size > progressLimits.maxBackupBytes ? '' : await file.text();
      setPendingImport(makeReadBackup().execute({ courseSlug, content, sizeInBytes: file.size }));
    } catch (error) {
      const text = error instanceof InvalidBackupError ? BACKUP_ERRORS[error.reason] : 'Não foi possível ler esse arquivo.';
      setMessage({ tone: 'error', text });
    }
  };

  return {
    pendingImport,
    eraseRequested,
    message,
    exportBackup() {
      if (!progress) return;
      makeExportBackup().execute({ courseSlug, progress });
      setMessage({ tone: 'success', text: 'Backup salvo na pasta de downloads.' });
    },
    exportJournal() {
      const journalExport = buildJournalExport();
      if (!progress || !journalExport) return;
      makeExportJournal().execute({ courseSlug, progress, journalExport });
      setMessage({ tone: 'success', text: 'Diário salvo na pasta de downloads.' });
    },
    readFile: (file: File) => void readFile(file),
    confirmImport() {
      if (!pendingImport) return;
      actions.replaceProgress(pendingImport.progress);
      setPendingImport(null);
      setMessage({ tone: 'success', text: 'Progresso restaurado do backup.' });
    },
    cancelImport: () => setPendingImport(null),
    requestErase: () => setEraseRequested(true),
    cancelErase: () => setEraseRequested(false),
    async confirmErase() {
      setEraseRequested(false);
      try {
        await actions.eraseProgress();
        setMessage({ tone: 'success', text: 'Seu progresso neste curso foi apagado.' });
      } catch {
        setMessage({ tone: 'error', text: 'Não foi possível apagar agora. Tente de novo em instantes.' });
      }
    },
  };
}

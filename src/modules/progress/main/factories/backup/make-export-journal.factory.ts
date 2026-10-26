import { makeFileDownloader } from '@/shared/main/factories/make-file-downloader.factory';
import { ExportJournalUseCase } from '../../../application/use-cases/backup/export-journal.use-case';

export function makeExportJournal(): ExportJournalUseCase {
  return new ExportJournalUseCase(makeFileDownloader());
}

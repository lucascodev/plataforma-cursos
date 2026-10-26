import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { makeFileDownloader } from '@/shared/main/factories/make-file-downloader.factory';
import { ExportBackupUseCase } from '../../../application/use-cases/backup/export-backup.use-case';
import { JsonBackupCodec } from '../../../infra/codecs/json-backup.codec';

export function makeExportBackup(): ExportBackupUseCase {
  return new ExportBackupUseCase(new JsonBackupCodec(), makeFileDownloader(), makeClock());
}

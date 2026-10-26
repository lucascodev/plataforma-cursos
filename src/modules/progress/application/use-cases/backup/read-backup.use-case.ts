import { progressLimits } from '@contracts/progress/progress-limits';
import { InvalidBackupError } from '../../../domain/errors/invalid-backup.error';
import type { BackupCodec } from '../../ports/backup-codec.interface';
import type { ReadBackupInputDto } from '../../dtos/read-backup/read-backup-input.dto';
import type { ReadBackupOutputDto } from '../../dtos/read-backup/read-backup-output.dto';

export class ReadBackupUseCase {
  constructor(private readonly backupCodec: BackupCodec) {}

  execute(input: ReadBackupInputDto): ReadBackupOutputDto {
    if (input.sizeInBytes > progressLimits.maxBackupBytes) throw new InvalidBackupError('too-large');
    const backup = this.backupCodec.decode(input.content);
    if (backup.courseSlug !== input.courseSlug) throw new InvalidBackupError('other-course');
    return {
      progress: backup.progress,
      exportedAt: backup.exportedAt,
      completedItems: Object.keys(backup.progress.completedItems).length,
      studyDays: Object.keys(backup.progress.studyDays).length,
      journalEntries: Object.keys(backup.progress.journal).length,
    };
  }
}

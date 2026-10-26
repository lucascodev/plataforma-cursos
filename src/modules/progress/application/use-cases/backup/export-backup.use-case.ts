import type { Clock } from '@/shared/application/ports/clock.interface';
import type { FileDownloader } from '@/shared/application/ports/files/file-downloader.interface';
import type { BackupCodec } from '../../ports/backup-codec.interface';
import type { ExportBackupInputDto } from '../../dtos/export-backup/export-backup-input.dto';

export class ExportBackupUseCase {
  constructor(
    private readonly backupCodec: BackupCodec,
    private readonly fileDownloader: FileDownloader,
    private readonly clock: Clock,
  ) {}

  execute(input: ExportBackupInputDto): void {
    const content = this.backupCodec.encode({
      format: 'cursos-abertos/progresso',
      version: 1,
      courseSlug: input.courseSlug,
      exportedAt: this.clock.now().toISOString(),
      progress: input.progress,
    });
    this.fileDownloader.download({
      filename: `backup-${input.courseSlug}-${this.clock.today()}.json`,
      content,
      mimeType: 'application/json',
    });
  }
}

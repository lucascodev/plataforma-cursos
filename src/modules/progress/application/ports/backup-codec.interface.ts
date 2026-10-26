import type { ProgressBackup } from '../../domain/entities/progress-backup.entity';

export interface BackupCodec {
  encode(backup: ProgressBackup): string;
  decode(content: string): ProgressBackup;
}

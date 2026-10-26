import type { BackupCodec } from '../../application/ports/backup-codec.interface';
import type { ProgressBackup } from '../../domain/entities/progress-backup.entity';
import { InvalidBackupError } from '../../domain/errors/invalid-backup.error';
import { mapProgressRecordToEntity } from '../mappers/progress-record-to-entity.mapper';
import { progressBackupSchema } from '../schemas/progress-backup.schema';

export class JsonBackupCodec implements BackupCodec {
  encode(backup: ProgressBackup): string {
    return `${JSON.stringify(backup, null, 2)}\n`;
  }

  decode(content: string): ProgressBackup {
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      throw new InvalidBackupError('not-json');
    }
    const result = progressBackupSchema.safeParse(raw);
    if (!result.success) throw new InvalidBackupError('wrong-format');
    return { ...result.data, progress: mapProgressRecordToEntity(result.data.progress) };
  }
}

import { ReadBackupUseCase } from '../../../application/use-cases/backup/read-backup.use-case';
import { JsonBackupCodec } from '../../../infra/codecs/json-backup.codec';

export function makeReadBackup(): ReadBackupUseCase {
  return new ReadBackupUseCase(new JsonBackupCodec());
}

export class InvalidBackupError extends Error {
  constructor(readonly reason: 'too-large' | 'not-json' | 'wrong-format' | 'other-course') {
    super(`Invalid backup: ${reason}`);
    this.name = 'InvalidBackupError';
  }
}

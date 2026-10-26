export interface BackupMessage {
  readonly tone: 'success' | 'error';
  readonly text: string;
}

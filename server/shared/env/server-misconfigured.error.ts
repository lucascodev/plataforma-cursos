export class ServerMisconfiguredError extends Error {
  constructor(reason: string) {
    super(`Server misconfigured: ${reason}`);
    this.name = 'ServerMisconfiguredError';
  }
}

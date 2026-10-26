export class SessionExpiredError extends Error {
  constructor() {
    super('The session is missing or expired');
    this.name = 'SessionExpiredError';
  }
}

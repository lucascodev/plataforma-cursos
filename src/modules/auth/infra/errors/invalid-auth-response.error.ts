export class InvalidAuthResponseError extends Error {
  constructor() {
    super('The session endpoint returned an unexpected body');
    this.name = 'InvalidAuthResponseError';
  }
}

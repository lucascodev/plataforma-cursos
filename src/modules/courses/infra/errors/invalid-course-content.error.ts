export class InvalidCourseContentError extends Error {
  constructor(
    readonly source: string,
    readonly problems: readonly string[],
  ) {
    super(`Invalid course content in ${source}: ${problems.join('; ')}`);
    this.name = 'InvalidCourseContentError';
  }
}

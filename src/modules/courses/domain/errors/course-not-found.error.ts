export class CourseNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`Course not found: ${slug}`);
    this.name = 'CourseNotFoundError';
  }
}

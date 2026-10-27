export type CourseCheckSeverity = 'error' | 'warning';

export interface CourseCheck {
  readonly severity: CourseCheckSeverity;
  readonly path: readonly (string | number)[];
  readonly where: string;
  readonly message: string;
}

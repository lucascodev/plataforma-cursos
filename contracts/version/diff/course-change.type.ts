export type CourseChangeArea = 'info' | 'modules' | 'guide' | 'rhythm';

export interface CourseChange {
  readonly area: CourseChangeArea;
  readonly text: string;
}

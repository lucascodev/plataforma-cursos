export interface FeaturedCourseView {
  readonly slug: string;
  readonly title: string;
  readonly level: string;
  readonly tagline: string;
  readonly facts: readonly string[];
  readonly trail: readonly { readonly id: string; readonly code: string; readonly title: string; readonly meta: string; readonly isCapstone: boolean }[];
}

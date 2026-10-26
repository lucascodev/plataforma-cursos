export interface BreadcrumbItem {
  readonly label: string;
  /** Omitted for the current page. */
  readonly to?: string;
}

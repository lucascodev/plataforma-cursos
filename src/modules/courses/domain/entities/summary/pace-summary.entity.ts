export interface PaceSummary {
  readonly status: 'ahead' | 'behind' | 'on-track';
  readonly items: number;
}

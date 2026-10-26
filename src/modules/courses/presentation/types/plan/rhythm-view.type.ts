export interface RhythmBarView {
  readonly label: string;
  readonly hours: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly isLong: boolean;
}

export interface RhythmView {
  readonly width: number;
  readonly height: number;
  readonly baseline: number;
  readonly bars: readonly RhythmBarView[];
  readonly weeklyHours: number;
  readonly summary: string;
}

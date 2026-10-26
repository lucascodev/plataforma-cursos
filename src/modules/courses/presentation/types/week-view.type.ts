import type { WeekDayView } from './week-day-view.type';

export interface WeekView {
  readonly label: string;
  readonly days: readonly WeekDayView[];
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  goBack(): void;
  goForward(): void;
  goToCurrent(): void;
}

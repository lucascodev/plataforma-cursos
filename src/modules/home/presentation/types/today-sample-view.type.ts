export interface TodaySampleView {
  readonly dateLabel: string;
  readonly hoursLabel: string;
  readonly courseLabel: string;
  readonly title: string;
  readonly detail: string;
  readonly week: readonly { readonly key: string; readonly weekday: string; readonly day: string; readonly isToday: boolean }[];
  readonly rhythmText: string;
}

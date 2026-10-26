import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface JournalExport {
  readonly courseTitle: string;
  readonly exportedOn: DateKey;
  readonly completionPercent: number;
  readonly currentModuleTitle: string;
  readonly modules: readonly { readonly id: string; readonly label: string }[];
  readonly dayLabels: Readonly<Record<DateKey, string>>;
}

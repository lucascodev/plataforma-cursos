import type { ThemePreference } from '../types/theme-preference.type';

export interface AccountSettings {
  readonly timezone: string;
  readonly theme: ThemePreference;
  readonly notify: {
    readonly proposalUpdates: boolean;
    readonly weeklySummary: boolean;
  };
}

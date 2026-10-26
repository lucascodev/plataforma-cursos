import type { StudyNavIconName } from './study-nav-icon-name.type';

export interface StudyNavLink {
  readonly to: string;
  readonly label: string;
  readonly icon: StudyNavIconName;
  readonly showOnMobile: boolean;
}

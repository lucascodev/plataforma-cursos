import type { ReactNode } from 'react';

export interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon?: ReactNode;
  /** Only highlight on an exact match, for index routes. */
  readonly end?: boolean;
}

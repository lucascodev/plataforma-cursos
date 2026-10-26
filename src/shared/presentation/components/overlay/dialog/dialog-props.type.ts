import type { ReactNode } from 'react';

export interface DialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: ReactNode;
  readonly children?: ReactNode;
  readonly actions?: ReactNode;
  /** alertdialog: a decision that cannot be dismissed by clicking outside. */
  readonly role?: 'dialog' | 'alertdialog';
  readonly onClose: () => void;
}

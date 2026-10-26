export interface ToastInput {
  readonly text: string;
  readonly tone?: 'success' | 'info' | 'warning';
  readonly action?: { readonly label: string; readonly onAction: () => void };
}

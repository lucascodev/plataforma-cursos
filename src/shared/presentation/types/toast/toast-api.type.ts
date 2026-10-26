import type { ToastInput } from './toast-input.type';

export interface ToastApi {
  show(input: ToastInput): void;
  dismiss(id: number): void;
}

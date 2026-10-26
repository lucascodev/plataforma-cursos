import type { ToastInput } from './toast-input.type';

export interface ToastMessage extends ToastInput {
  readonly id: number;
}

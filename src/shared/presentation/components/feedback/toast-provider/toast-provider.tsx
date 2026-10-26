import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from '../../../contexts/toast-context';
import type { ToastApi } from '../../../types/toast/toast-api.type';
import type { ToastMessage } from '../../../types/toast/toast-message.type';
import { ToastViewport } from './components/toast-viewport/toast-viewport';

const TOAST_DURATION_MS = 4000;
const MAX_VISIBLE_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly ToastMessage[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const dismiss = (id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const api: ToastApi = {
    show(input) {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...input, id }].slice(-MAX_VISIBLE_TOASTS));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), TOAST_DURATION_MS),
      );
    },
    dismiss,
  };

  return (
    <ToastContext value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}

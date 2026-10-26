import { useContext } from 'react';
import { ToastContext } from '../../contexts/toast-context';
import type { ToastApi } from '../../types/toast/toast-api.type';

export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used inside ToastProvider');
  return toast;
}

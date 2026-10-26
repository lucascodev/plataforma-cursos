import { createContext } from 'react';
import type { ToastApi } from '../types/toast/toast-api.type';

export const ToastContext = createContext<ToastApi | null>(null);

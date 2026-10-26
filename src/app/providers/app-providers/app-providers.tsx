import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthSessionProvider } from '@/modules/auth';
import { ToastProvider } from '@/shared/presentation/components/feedback/toast-provider/toast-provider';
import { createQueryClient } from '../query-client/create-query-client';

const queryClient = createQueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

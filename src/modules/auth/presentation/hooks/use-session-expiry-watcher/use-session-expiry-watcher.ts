import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';

export function useSessionExpiryWatcher(onExpired: () => void): void {
  const queryClient = useQueryClient();
  const onExpiredRef = useRef(onExpired);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  });

  useEffect(() => {
    const check = (error: unknown) => {
      if (error instanceof SessionExpiredError) onExpiredRef.current();
    };
    const stopQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') check(event.query.state.error);
    });
    const stopMutations = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated') check(event.mutation.state.error);
    });
    return () => {
      stopQueries();
      stopMutations();
    };
  }, [queryClient]);
}

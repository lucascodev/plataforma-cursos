import { useEffect } from 'react';

// Asks the browser to confirm before closing or reloading the tab while something is not saved yet.
export function useLeaveWarning(shouldWarn: boolean): void {
  useEffect(() => {
    if (!shouldWarn) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [shouldWarn]);
}

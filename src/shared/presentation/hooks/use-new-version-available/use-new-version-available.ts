import { useEffect, useState } from 'react';
import { makeVersionChecker } from '@/shared/main/factories/make-version-checker.factory';

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

// Checks when the tab comes back into view and every 15 minutes, and stops once a newer build is found.
export function useNewVersionAvailable(): boolean {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (isAvailable) return;
    const checker = makeVersionChecker();
    let cancelled = false;
    const check = async () => {
      if (document.visibilityState !== 'visible') return;
      const published = await checker.publishedBuildId();
      if (!cancelled && published !== null && published !== checker.currentBuildId()) setIsAvailable(true);
    };
    const onVisibilityChange = () => void check();
    document.addEventListener('visibilitychange', onVisibilityChange);
    const interval = setInterval(() => void check(), CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, [isAvailable]);

  return isAvailable;
}

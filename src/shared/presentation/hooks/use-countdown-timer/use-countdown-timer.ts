import { useEffect, useState } from 'react';

const TICK_MS = 1000;

export function useCountdownTimer(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setRemaining((current) => Math.max(0, current - 1)), TICK_MS);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (remaining === 0) setIsRunning(false);
  }, [remaining]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return {
    label: `${minutes}:${seconds}`,
    isRunning,
    isFinished: remaining === 0,
    toggle: () => setIsRunning((current) => !current && remaining > 0),
    reset: () => {
      setIsRunning(false);
      setRemaining(totalSeconds);
    },
  };
}

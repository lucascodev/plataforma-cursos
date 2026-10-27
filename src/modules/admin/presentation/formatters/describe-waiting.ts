const DAY_MS = 86_400_000;

// "há 3 dias" from a timestamp, for the queue: what matters is how long something has waited.
export function describeWaiting(since: string, now: number): string {
  const days = Math.floor((now - new Date(since).getTime()) / DAY_MS);
  if (days <= 0) return 'desde hoje';
  return days === 1 ? 'há 1 dia' : `há ${days} dias`;
}

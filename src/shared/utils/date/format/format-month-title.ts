import { MONTH_LONG_NAMES } from '../names/month-long-names';

// "2027-01" → "Janeiro de 2027"
export function formatMonthTitle(month: string): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const name = MONTH_LONG_NAMES[monthNumber - 1] ?? '';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

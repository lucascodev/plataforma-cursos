const MONTHS_IN_YEAR = 12;

// Works on "YYYY-MM" month keys.
export function addMonths(month: string, count: number): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const index = year * MONTHS_IN_YEAR + (monthNumber - 1) + count;
  return `${Math.floor(index / MONTHS_IN_YEAR)}-${String((index % MONTHS_IN_YEAR) + 1).padStart(2, '0')}`;
}

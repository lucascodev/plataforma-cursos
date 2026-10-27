// The API hides counts below 5, so no single student can be singled out.
export function describeSmallCount(count: number | null): string {
  return count === null ? 'menos de 5' : count.toLocaleString('pt-BR');
}

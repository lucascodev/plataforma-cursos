export function resolveSundayIndex(sunday: number, totalSundays: number): number {
  return sunday < 0 ? totalSundays + sunday : sunday;
}

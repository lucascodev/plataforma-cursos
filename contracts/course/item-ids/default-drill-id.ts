// Drills written before ids existed are identified by position. The same rule lives in the course_item_ids migration.
export function defaultDrillId(drillIndex: number): string {
  return `e${drillIndex}`;
}

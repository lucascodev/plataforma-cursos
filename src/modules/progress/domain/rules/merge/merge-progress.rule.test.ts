import { describe, expect, it } from 'vitest';
import { createEmptyProgress } from '../create-empty-progress.rule';
import { setItemCompletion } from '../updates/set-item-completion.rule';
import { setJournalEntry } from '../updates/set-journal-entry.rule';
import { setStartDate } from '../updates/set-start-date.rule';
import { mergeProgress } from './merge-progress.rule';

const base = setItemCompletion(createEmptyProgress(), 'm1-t0', true);

describe('mergeProgress', () => {
  it('keeps what each tab marked', () => {
    const local = setItemCompletion(base, 'm1-t1', true);
    const remote = setItemCompletion(base, 'm1-t2', true);
    expect(Object.keys(mergeProgress(base, local, remote).completedItems).sort()).toEqual(['m1-t0', 'm1-t1', 'm1-t2']);
  });

  it('applies an unmark made in this tab instead of bringing the item back', () => {
    const local = setItemCompletion(base, 'm1-t0', false);
    const remote = setItemCompletion(base, 'm1-t2', true);
    expect(Object.keys(mergeProgress(base, local, remote).completedItems)).toEqual(['m1-t2']);
  });

  it('keeps an unmark made in the other tab when this tab did not touch the item', () => {
    const local = setItemCompletion(base, 'm1-t1', true);
    const remote = setItemCompletion(base, 'm1-t0', false);
    expect(Object.keys(mergeProgress(base, local, remote).completedItems)).toEqual(['m1-t1']);
  });

  it('this tab wins only on the texts it edited', () => {
    const withEntries = setJournalEntry(setJournalEntry(base, '2026-10-26', 'a'), '2026-10-27', 'b');
    const local = setJournalEntry(withEntries, '2026-10-26', 'local');
    const remote = setJournalEntry(withEntries, '2026-10-27', 'remote');
    expect(mergeProgress(withEntries, local, remote).journal).toEqual({ '2026-10-26': 'local', '2026-10-27': 'remote' });
  });

  it('takes the other start date unless this tab changed it', () => {
    const remote = setStartDate(base, '2026-11-02', 'user');
    expect(mergeProgress(base, base, remote).startDate).toBe('2026-11-02');
    const local = setStartDate(base, '2026-11-09', 'user');
    expect(mergeProgress(base, local, remote).startDate).toBe('2026-11-09');
  });
});

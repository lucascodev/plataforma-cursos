import { describe, expect, it } from 'vitest';
import { progressLimits } from '@contracts/progress/progress-limits';
import { buildJournalMarkdown } from './build-journal-markdown.rule';
import { createEmptyProgress } from './create-empty-progress.rule';
import { setItemCompletion } from './updates/set-item-completion.rule';
import { setJournalEntry } from './updates/set-journal-entry.rule';

describe('progress rules', () => {
  it('toggles items without mutating the original', () => {
    const empty = createEmptyProgress();
    const done = setItemCompletion(empty, 'm1-t0', true);
    expect(done.completedItems).toEqual({ 'm1-t0': true });
    expect(empty.completedItems).toEqual({});
    expect(setItemCompletion(done, 'm1-t0', false).completedItems).toEqual({});
  });

  it('removes empty journal entries and limits long ones', () => {
    const withEntry = setJournalEntry(createEmptyProgress(), '2026-10-26', 'Ollama instalado');
    expect(withEntry.journal['2026-10-26']).toBe('Ollama instalado');
    expect(setJournalEntry(withEntry, '2026-10-26', '   ').journal).toEqual({});
    const long = setJournalEntry(createEmptyProgress(), '2026-10-27', 'x'.repeat(progressLimits.maxTextLength + 10));
    expect(long.journal['2026-10-27']?.length).toBe(progressLimits.maxTextLength);
  });

  it('exports the journal as Markdown sorted by date', () => {
    const progress = setJournalEntry(setJournalEntry(createEmptyProgress(), '2026-10-27', 'segundo'), '2026-10-26', 'primeiro');
    const markdown = buildJournalMarkdown(progress, {
      courseTitle: 'Engenharia de IA',
      exportedOn: '2026-10-28',
      completionPercent: 3,
      currentModuleTitle: 'Fundamentos de LLM',
      modules: [],
      dayLabels: { '2026-10-26': 'seg · Início do curso' },
    });
    expect(markdown.indexOf('primeiro')).toBeLessThan(markdown.indexOf('segundo'));
    expect(markdown).toContain('### 2026-10-26 · seg · Início do curso');
  });
});

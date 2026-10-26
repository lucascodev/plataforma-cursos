import { describe, expect, it } from 'vitest';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';
import { buildStudyPlan } from '../plan/build-study-plan.rule';
import { filterJournalEntries } from './filter-journal-entries.rule';
import { listJournalEntries } from './list-journal-entries.rule';

const plan = buildStudyPlan(loadTestCourse(), '2026-10-26');
const journal = { '2026-10-27': 'Instalei o uv e o Ollama.', '2026-10-29': 'Travei na tokenização.', '2026-10-28': '   ' };

describe('diário', () => {
  it('lista do mais novo para o mais antigo, sem entradas vazias, com o módulo do dia', () => {
    const entries = listJournalEntries(journal, plan);
    expect(entries.map((entry) => entry.date)).toEqual(['2026-10-29', '2026-10-27']);
    expect(entries[0]?.moduleIndex).toBe(0);
  });

  it('filtra por palavras sem acento e por módulo', () => {
    const entries = listJournalEntries(journal, plan);
    expect(filterJournalEntries(entries, 'tokenizacao', null).map((entry) => entry.date)).toEqual(['2026-10-29']);
    expect(filterJournalEntries(entries, '', 3)).toEqual([]);
  });
});

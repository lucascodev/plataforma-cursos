import { describe, expect, it } from 'vitest';
import { suggestCourseSlug } from './suggest-course-slug.rule';

describe('suggestCourseSlug', () => {
  it('removes accents, symbols and repeated separators', () => {
    expect(suggestCourseSlug('Introdução à Análise de Dados!')).toBe('introducao-a-analise-de-dados');
    expect(suggestCourseSlug('  C++ & Rust: do zero  ')).toBe('c-rust-do-zero');
  });

  it('keeps the result within 60 characters without a trailing hyphen', () => {
    const slug = suggestCourseSlug(`${'palavra '.repeat(7)}final`);
    expect(slug.length).toBeLessThan(61);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('returns an empty string when nothing usable is left', () => {
    expect(suggestCourseSlug('!!!')).toBe('');
  });
});

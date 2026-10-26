import { describe, expect, it } from 'vitest';
import { proposalInputSchema } from './proposal-input.schema.ts';

const valid = {
  title: 'Python do zero',
  summary: 'Curso prático.',
  audience: 'Iniciantes',
  area: 'Programação',
  language: 'pt-BR',
  outline: ['Básico', 'Projeto'],
  experience: '',
  sampleUrl: null,
  suggestedSlug: null,
};

describe('proposalInputSchema', () => {
  it('accepts a complete proposal and trims text', () => {
    const parsed = proposalInputSchema.parse({ ...valid, title: '  Python do zero  ' });
    expect(parsed.title).toBe('Python do zero');
  });

  it('refuses links that are not https and slugs with spaces', () => {
    expect(proposalInputSchema.safeParse({ ...valid, sampleUrl: 'http://exemplo.com' }).success).toBe(false);
    expect(proposalInputSchema.safeParse({ ...valid, sampleUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(proposalInputSchema.safeParse({ ...valid, suggestedSlug: 'Python Zero' }).success).toBe(false);
  });

  it('needs at least one module and at most 30', () => {
    expect(proposalInputSchema.safeParse({ ...valid, outline: [] }).success).toBe(false);
    expect(proposalInputSchema.safeParse({ ...valid, outline: Array.from({ length: 31 }, (_, i) => `M${i}`) }).success).toBe(false);
  });
});

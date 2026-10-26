import { describe, expect, it } from 'vitest';
import { pluralize } from './pluralize';

describe('pluralize', () => {
  it('usa o singular de 1 até antes de 2 e vírgula nos decimais', () => {
    expect(pluralize(1, 'mês', 'meses')).toBe('1 mês');
    expect(pluralize(1.5, 'mês', 'meses')).toBe('1,5 mês');
    expect(pluralize(2, 'mês', 'meses')).toBe('2 meses');
    expect(pluralize(0, 'aula', 'aulas')).toBe('0 aulas');
    expect(pluralize(1200, 'hora', 'horas')).toBe('1.200 horas');
  });
});

import { describe, expect, it } from 'vitest';
import { safeReturnPath } from './safe-return-path.rule';

describe('safeReturnPath', () => {
  it('aceita só caminhos internos', () => {
    expect(safeReturnPath('/cursos/engenharia-de-ia', '/')).toBe('/cursos/engenharia-de-ia');
    expect(safeReturnPath('//evil.example', '/')).toBe('/');
    expect(safeReturnPath('https://evil.example', '/')).toBe('/');
    expect(safeReturnPath('/a?b=c', '/')).toBe('/');
    expect(safeReturnPath(null, '/')).toBe('/');
  });
});

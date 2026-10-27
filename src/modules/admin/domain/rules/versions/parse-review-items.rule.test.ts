import { describe, expect, it } from 'vitest';
import { parseReviewItems } from './parse-review-items.rule';

describe('parseReviewItems', () => {
  it('turns each line into a point and drops list markers and blanks', () => {
    expect(parseReviewItems('- Revise a aula 2\n\n2) Corrija o link\n  * Detalhe o projeto  ')).toEqual([
      'Revise a aula 2',
      'Corrija o link',
      'Detalhe o projeto',
    ]);
  });

  it('keeps at most 20 points', () => {
    expect(parseReviewItems(Array.from({ length: 25 }, (_, index) => `Ponto ${index}`).join('\n'))).toHaveLength(20);
  });
});

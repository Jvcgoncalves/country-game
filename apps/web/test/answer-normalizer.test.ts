import { describe, expect, it } from 'vitest';
import { AnswerNormalizer } from '../src/services/answer-normalizer';

describe('AnswerNormalizer', () => {
  it('normalizes case, diacritics, punctuation, and whitespace', () => {
    expect(AnswerNormalizer.normalize('  Côte-d’Ivoire!!  ')).toBe('cote d ivoire');
  });
});

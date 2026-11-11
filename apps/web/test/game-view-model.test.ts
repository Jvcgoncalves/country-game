import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameViewModel } from '../src/viewmodels/game-view-model';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GameViewModel', () => {
  it('reveals hints in order and stops after three', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ questions: [
      {
        code: 'NZ',
        answer: 'New Zealand',
        aliases: [],
        capital: 'Wellington',
        currency: 'New Zealand dollar',
        flagUrl: 'https://flagcdn.com/w320/nz.png',
      },
    ] }), { status: 200 })));

    const model = new GameViewModel();
    model.setCustomCount('1');
    await model.startRound();
    model.revealHint();
    expect(model.getSnapshot().hintsRevealed).toBe(1);
    model.revealHint();
    expect(model.getSnapshot().hintsRevealed).toBe(2);
    model.revealHint();
    expect(model.getSnapshot().hintsRevealed).toBe(3);
    model.revealHint();

    expect(model.getSnapshot().hintsRevealed).toBe(3);
  });

  it('scores accepted aliases once and keeps score when round ends', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ questions: [
      {
        code: 'CI',
        answer: 'Côte d’Ivoire',
        aliases: ['Ivory Coast'],
        capital: 'Yamoussoukro',
        currency: 'West African CFA franc',
        flagUrl: 'https://flagcdn.com/w320/ci.png',
      },
      {
        code: 'NZ',
        answer: 'New Zealand',
        aliases: [],
        capital: 'Wellington',
        currency: 'New Zealand dollar',
        flagUrl: 'https://flagcdn.com/w320/nz.png',
      },
    ] }), { status: 200 })));

    const model = new GameViewModel();
    model.setCustomCount('2');
    await model.startRound();
    model.setGuessInput(' IVORY   coast ');
    model.submitGuess();
    model.submitGuess();
    model.advance();
    expect(model.getSnapshot().hintsRevealed).toBe(0);
    expect(model.getSnapshot().answerRevealed).toBe(false);
    model.revealAnswer();
    model.advance();

    expect(model.getSnapshot().screen).toBe('results');
    expect(model.getSnapshot().score).toBe(1);
  });
});

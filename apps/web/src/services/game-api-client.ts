import type { GameLanguage, GameQuestion } from '../types/game-types';

export class GameApiClient {
  static async requestRound(count: number, language: GameLanguage): Promise<GameQuestion[]> {
    const query = new URLSearchParams({ count: String(count), language });
    const response = await fetch(`/api/round?${query.toString()}`);
    if (!response.ok) throw new Error('Round request failed.');

    const payload: unknown = await response.json();
    if (!GameApiClient.isRoundPayload(payload) || payload.questions.length !== count) {
      throw new Error('Round response was invalid.');
    }

    return payload.questions;
  }

  private static isRoundPayload(value: unknown): value is { questions: GameQuestion[] } {
    if (typeof value !== 'object' || value === null || !('questions' in value)) return false;
    const questions = value.questions;
    return Array.isArray(questions) && questions.every(GameApiClient.isQuestion);
  }

  private static isQuestion(value: unknown): value is GameQuestion {
    if (typeof value !== 'object' || value === null) return false;
    if (!('code' in value) || typeof value.code !== 'string') return false;
    if (!('answer' in value) || typeof value.answer !== 'string') return false;
    if (!('aliases' in value) || !Array.isArray(value.aliases)) return false;
    if (!value.aliases.every((alias: unknown) => typeof alias === 'string')) return false;
    if (!('capital' in value) || !(value.capital === null || typeof value.capital === 'string')) return false;
    if (!('currency' in value) || !(value.currency === null || typeof value.currency === 'string')) return false;
    return 'flagUrl' in value && typeof value.flagUrl === 'string';
  }
}

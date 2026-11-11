import { AnswerNormalizer } from '../services/answer-normalizer';
import { GameApiClient } from '../services/game-api-client';
import type { GameLanguage, GameQuestion, GameState, StateListener } from '../types/game-types';

export class GameViewModel {
  private state: GameState = {
    screen: 'start',
    language: GameViewModel.readLanguage(),
    selectedRoundSize: 5,
    customCount: '5',
    questions: [],
    currentIndex: 0,
    score: 0,
    hintsRevealed: 0,
    answerRevealed: false,
    hasGuessedCorrectly: false,
    guessInput: '',
    feedback: null,
    startError: null,
    loading: false,
    flagLoadFailed: false,
  };

  private listeners = new Set<StateListener>();

  getSnapshot = (): Readonly<GameState> => this.state;

  subscribe = (listener: StateListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  setLanguage(language: GameLanguage): void {
    if (this.state.screen === 'game' || this.state.loading) return;
    GameViewModel.saveLanguage(language);
    this.update({ language, startError: null });
  }

  selectPreset(count: number): void {
    if (![5, 10, 25].includes(count)) return;
    this.update({ selectedRoundSize: count, customCount: String(count), startError: null });
  }

  setCustomCount(value: string): void {
    this.update({ selectedRoundSize: null, customCount: value, startError: null });
  }

  async startRound(): Promise<void> {
    if (this.state.loading) return;

    const count = this.state.selectedRoundSize ?? Number(this.state.customCount);
    if (!Number.isInteger(count) || count < 1 || count > 50) {
      this.update({ startError: 'invalid-round-size' });
      return;
    }

    this.update({ loading: true, startError: null });
    try {
      const questions = await GameApiClient.requestRound(count, this.state.language);
      this.update({
        screen: 'game',
        questions,
        currentIndex: 0,
        score: 0,
        hintsRevealed: 0,
        answerRevealed: false,
        hasGuessedCorrectly: false,
        guessInput: '',
        feedback: null,
        loading: false,
        flagLoadFailed: false,
      });
    } catch {
      this.update({ loading: false, startError: 'unavailable' });
    }
  }

  setGuessInput(value: string): void {
    if (this.state.screen !== 'game' || this.isCurrentQuestionComplete()) return;
    this.update({ guessInput: value, feedback: null });
  }

  submitGuess(): void {
    const question = this.getCurrentQuestion();
    if (!question || this.isCurrentQuestionComplete() || !this.state.guessInput.trim()) return;

    const guess = AnswerNormalizer.normalize(this.state.guessInput);
    const acceptedAnswers = [question.answer, ...question.aliases];
    const isCorrect = acceptedAnswers.some(
      (answer) => AnswerNormalizer.normalize(answer) === guess,
    );

    if (!isCorrect) {
      this.update({ feedback: 'incorrect' });
      return;
    }

    this.update({
      score: this.state.score + 1,
      hasGuessedCorrectly: true,
      feedback: 'correct',
    });
  }

  revealHint(): void {
    if (this.isCurrentQuestionComplete() || this.state.hintsRevealed >= 3) return;
    this.update({ hintsRevealed: this.state.hintsRevealed + 1 });
  }

  revealAnswer(): void {
    if (this.isCurrentQuestionComplete()) return;
    this.update({ answerRevealed: true, feedback: null });
  }

  advance(): void {
    if (!this.isCurrentQuestionComplete()) return;
    if (this.state.currentIndex >= this.state.questions.length - 1) {
      this.update({ screen: 'results' });
      return;
    }

    this.update({
      currentIndex: this.state.currentIndex + 1,
      hintsRevealed: 0,
      answerRevealed: false,
      hasGuessedCorrectly: false,
      guessInput: '',
      feedback: null,
      flagLoadFailed: false,
    });
  }

  markFlagUnavailable(): void {
    this.update({ flagLoadFailed: true });
  }

  giveUp() {
    if (this.state.screen !== 'game') return;
    this.resetRound();
  }

  playAgain(): void {
    this.resetRound();
  }

  private resetRound() {
    this.update({
      screen: 'start',
      questions: [],
      currentIndex: 0,
      score: 0,
      hintsRevealed: 0,
      answerRevealed: false,
      hasGuessedCorrectly: false,
      guessInput: '',
      feedback: null,
      startError: null,
      flagLoadFailed: false,
    });
  }

  getCurrentQuestion(): GameQuestion | null {
    return this.state.questions[this.state.currentIndex] ?? null;
  }

  isCurrentQuestionComplete(): boolean {
    return this.state.hasGuessedCorrectly || this.state.answerRevealed;
  }

  private update(changes: Partial<GameState>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => listener(this.state));
  }

  private static readLanguage(): GameLanguage {
    if (typeof window === 'undefined') return 'en';
    try {
      return window.localStorage.getItem('guess-flags-language') === 'pt-BR' ? 'pt-BR' : 'en';
    } catch {
      return 'en';
    }
  }

  private static saveLanguage(language: GameLanguage): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('guess-flags-language', language);
    } catch {
      // Language choice remains active for this session when storage is unavailable.
    }
  }
}

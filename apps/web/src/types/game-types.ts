export type GameLanguage = 'en' | 'pt-BR';

export type GameScreen = 'start' | 'game' | 'results';

export type GuessFeedback = 'correct' | 'incorrect' | null;

export type StartError = 'invalid-round-size' | 'unavailable' | null;

export interface GameQuestion {
  code: string;
  answer: string;
  aliases: string[];
  capital: string | null;
  currency: string | null;
  flagUrl: string;
}

export interface GameState {
  screen: GameScreen;
  language: GameLanguage;
  selectedRoundSize: number | null;
  customCount: string;
  questions: GameQuestion[];
  currentIndex: number;
  score: number;
  hintsRevealed: number;
  answerRevealed: boolean;
  hasGuessedCorrectly: boolean;
  guessInput: string;
  feedback: GuessFeedback;
  startError: StartError;
  loading: boolean;
  flagLoadFailed: boolean;
}

export interface GameActions {
  setLanguage(language: GameLanguage): void;
  selectPreset(count: number): void;
  setCustomCount(value: string): void;
  startRound(): Promise<void>;
  setGuessInput(value: string): void;
  submitGuess(): void;
  revealHint(): void;
  revealAnswer(): void;
  advance(): void;
  markFlagUnavailable(): void;
  giveUp(): void;
  playAgain(): void;
  getCurrentQuestion(): GameQuestion | null;
  isCurrentQuestionComplete(): boolean;
}

export interface AppProps {
  model: GameActions;
  state: Readonly<GameState>;
}

export interface LanguagePickerProps {
  language: GameLanguage;
  text: LanguageCopy;
  onChange(language: GameLanguage): void;
  disabled?: boolean;
}

export interface LanguageCopy {
  title: string;
  heroTitlePrimary: string;
  heroTitleAccent: string;
  homeDescription: string;
  artCaption: string;
  chooseLanguage: string;
  chooseRound: string;
  roundDescription: string;
  customPrompt: string;
  customPlaceholder: string;
  start: string;
  loading: string;
  retry: string;
  invalidRoundSize: string;
  unavailable: string;
  questionTitle: string;
  progressDescription: string;
  score: string;
  answerTitle: string;
  answerDescription: string;
  guessLabel: string;
  guessPlaceholder: string;
  submitGuess: string;
  hint: string;
  hintHeading: string;
  hintNote: string;
  allHintsRevealed: string;
  capital: string;
  currency: string;
  firstLetters: string;
  unavailableHint: string;
  revealAnswer: string;
  flagUnavailable: string;
  flagAlt: string;
  correct: string;
  incorrect: string;
  answerIs: string;
  nextFlag: string;
  seeResults: string;
  results: string;
  finalScore: string;
  giveUp: string;
  playAgain: string;
}

export type CopyDictionary = Record<GameLanguage, LanguageCopy>;

export type StateListener = (state: Readonly<GameState>) => void;

import { useEffect, useState, useSyncExternalStore } from 'react';
import { copy } from './copy';
import { GameStyle } from './ui/game-style';
import { GameViewModel } from './viewmodels/game-view-model';
import type { AppProps, LanguagePickerProps } from './types/game-types';

export default function App() {
  const [model] = useState(() => new GameViewModel());
  const state = useSyncExternalStore(model.subscribe, model.getSnapshot, model.getSnapshot);
  const props: AppProps = { model, state };

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  return (
    <main className="app-shell">
      <section className="app-screen">
        {state.screen === 'start' && <StartView {...props} />}
        {state.screen === 'game' && <GameView {...props} />}
        {state.screen === 'results' && <ResultsView {...props} />}
      </section>
    </main>
  );
}

function StartView({ model, state }: AppProps) {
  const text = copy[state.language];

  return (
    <>
      <header className="topbar">
        <h1 className="brand">{text.title}</h1>
        <LanguagePicker language={state.language} text={text} onChange={(language) => model.setLanguage(language)} />
      </header>

      <div className="home-main">
        <section className="home-copy">
          <h2 className="hero-title">
            {text.heroTitlePrimary}<br />
            <span>{text.heroTitleAccent}</span>
          </h2>
          <p className="home-description">{text.homeDescription}</p>

          <div className="round-form">
            <label className="round-label">{text.chooseRound}</label>
            <p className="round-description">{text.roundDescription}</p>
            <div className="presets" role="group" aria-label={text.chooseRound}>
              {[5, 10, 25].map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={state.selectedRoundSize === count}
                  onClick={() => model.selectPreset(count)}
                  className={GameStyle.roundButton(state.selectedRoundSize === count)}
                >
                  {count}
                </button>
              ))}
            </div>
            <label className="custom-round">
              <span>{text.customPrompt}</span>
              <input
                type="number"
                min={1}
                max={50}
                step={1}
                inputMode="numeric"
                aria-label={text.customPlaceholder}
                placeholder="30"
                value={state.customCount}
                onChange={(event) => model.setCustomCount(event.target.value)}
              />
            </label>

            {state.startError === 'invalid-round-size' && (
              <p className="error-message" role="alert">{text.invalidRoundSize}</p>
            )}
            {state.startError === 'unavailable' && (
              <div className="error-panel" role="alert">
                <p>{text.unavailable}</p>
                <button type="button" onClick={() => void model.startRound()} className="retry-button">
                  {text.retry}
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={state.loading}
              onClick={() => void model.startRound()}
              className="primary-button"
            >
              {state.loading ? text.loading : text.start}
            </button>
            {state.loading && <p className="loading-message" role="status">{text.loading}</p>}
          </div>
        </section>

        <figure className="home-art" aria-hidden="true">
          <div className="flag-stack">
            <span className="flag-tile"><img src="https://flagcdn.com/w320/br.png" alt="" /></span>
            <span className="flag-tile"><img src="https://flagcdn.com/w320/jp.png" alt="" /></span>
            <span className="flag-tile"><img src="https://flagcdn.com/w320/ca.png" alt="" /></span>
            <span className="flag-tile"><img src="https://flagcdn.com/w320/za.png" alt="" /></span>
          </div>
          <figcaption className="art-caption">{text.artCaption}</figcaption>
        </figure>
      </div>
    </>
  );
}

function GameView({ model, state }: AppProps) {
  const text = copy[state.language];
  const question = model.getCurrentQuestion();
  if (!question) return null;

  const complete = model.isCurrentQuestionComplete();
  const isLastQuestion = state.currentIndex === state.questions.length - 1;
  const hints = [
    { label: text.capital, value: question.capital },
    { label: text.currency, value: question.currency },
    { label: text.firstLetters, value: question.answer.slice(0, 3) },
  ];
  const nextHint = hints[state.hintsRevealed];

  return (
    <>
      <header className="topbar">
        <h1 className="brand">{text.title}</h1>
        <div className="game-topbar-actions">
          <button type="button" onClick={() => model.giveUp()} className="secondary-button give-up-button">
            {text.giveUp}
          </button>
          <p className="score-readout"><span>{text.score}</span><strong>{state.score}</strong></p>
          <LanguagePicker language={state.language} text={text} onChange={(language) => model.setLanguage(language)} disabled />
        </div>
      </header>

      <div className="game-main">
        <section className="game-left" aria-label={text.flagAlt}>
          <div className="progress-row">
            <h2>{text.questionTitle}</h2>
            <strong>{state.currentIndex + 1}<span> / {state.questions.length}</span></strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label={text.progressDescription}
            aria-valuemin={1}
            aria-valuemax={state.questions.length}
            aria-valuenow={state.currentIndex + 1}
          >
            <span style={{ width: `${((state.currentIndex + 1) / state.questions.length) * 100}%` }} />
          </div>
          <figure className="flag-stage">
            {state.flagLoadFailed ? (
              <p className="flag-unavailable" role="status">{text.flagUnavailable}</p>
            ) : (
              <img
                key={question.code}
                src={question.flagUrl}
                alt={text.flagAlt}
                onError={() => model.markFlagUnavailable()}
              />
            )}
          </figure>
        </section>

        <section className="game-right">
          <h2>{text.answerTitle}</h2>
          <p className="answer-description">{text.answerDescription}</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              model.submitGuess();
            }}
          >
            <label className="answer-label" htmlFor="country-guess">{text.guessLabel}</label>
            <input
              id="country-guess"
              type="text"
              autoComplete="off"
              placeholder={text.guessPlaceholder}
              value={state.guessInput}
              disabled={complete}
              onChange={(event) => model.setGuessInput(event.target.value)}
              onFocus={(event) => {
                const input = event.currentTarget;
                if (
                  input.selectionStart !== null &&
                  input.selectionEnd !== null &&
                  input.selectionStart !== input.selectionEnd
                ) {
                  input.setSelectionRange(input.selectionEnd, input.selectionEnd);
                }
              }}
              className={GameStyle.textField()}
            />
            {!complete && (
              <button
                type="submit"
                disabled={!state.guessInput.trim()}
                className="primary-button answer-submit"
              >
                {text.submitGuess}
              </button>
            )}
          </form>

          {state.feedback && (
            <p className={`feedback-message ${state.feedback}`} role="status">
              {state.feedback === 'correct' ? text.correct : text.incorrect}
            </p>
          )}

          <section className="hint-section" aria-labelledby="hints-heading">
            <h3 id="hints-heading" className="hint-heading">{text.hintHeading}</h3>
            <div className="hint-box">
              <strong>{nextHint?.label ?? text.allHintsRevealed}</strong>
              <button
                type="button"
                disabled={complete || state.hintsRevealed >= hints.length}
                onClick={() => model.revealHint()}
              >
                {text.hint}
              </button>
            </div>
            <p className="hint-note">{text.hintNote}</p>
            {state.hintsRevealed > 0 && (
              <ol className="hint-list">
                {hints.slice(0, state.hintsRevealed).map((hint, index) => (
                  <li key={hint.label}>
                    <span aria-hidden="true">{index + 1}.</span>
                    <p><strong>{hint.label}:</strong> {hint.value || text.unavailableHint}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="answer-actions">
            {complete ? (
              <>
                <p className="answer-revealed"><strong>{text.answerIs}:</strong> {question.answer}</p>
                <button type="button" onClick={() => model.advance()} className="primary-button next-button">
                  {isLastQuestion ? text.seeResults : text.nextFlag}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => model.revealAnswer()} className="secondary-button">
                {text.revealAnswer}
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function ResultsView({ model, state }: AppProps) {
  const text = copy[state.language];

  return (
    <>
      <header className="topbar">
        <h1 className="brand">{text.title}</h1>
        <LanguagePicker language={state.language} text={text} onChange={(language) => model.setLanguage(language)} />
      </header>
      <section className="results-main" aria-labelledby="results-score">
        <h2>{text.results}</h2>
        <p className="results-label">{text.finalScore}</p>
        <p id="results-score" className="results-score">
          {state.score}<span> / {state.questions.length}</span>
        </p>
        <button type="button" onClick={() => model.playAgain()} className="primary-button">
          {text.playAgain}
        </button>
      </section>
    </>
  );
}

function LanguagePicker({ language, text, onChange, disabled = false }: LanguagePickerProps) {
  return (
    <div className="language-control">
      <span className="visually-hidden">{text.chooseLanguage}</span>
      <img className="language-flag" src={language === 'en' ? '/en-flag.png' : '/br-flag.png'} alt="" />
      <div className="language-options" role="group" aria-label={text.chooseLanguage}>
        <button
          type="button"
          aria-label="English"
          aria-pressed={language === 'en'}
          disabled={disabled}
          onClick={() => onChange('en')}
          className={GameStyle.languageButton(language === 'en')}
        >
          EN
        </button>
        <button
          type="button"
          aria-label="Português"
          aria-pressed={language === 'pt-BR'}
          disabled={disabled}
          onClick={() => onChange('pt-BR')}
          className={GameStyle.languageButton(language === 'pt-BR')}
        >
          PT-BR
        </button>
      </div>
    </div>
  );
}

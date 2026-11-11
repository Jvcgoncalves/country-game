# Guess Flags product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual solo players who want short rounds guessing countries from flags.

## Product Purpose

Let players choose a round length, identify flags, use hints when needed, see their score, and play again. Success means a complete round remains playable even when the upstream country service is temporarily unavailable.

## Operating Context

- Players use English or Brazilian Portuguese UI and country names.
- Round sizes: 5, 10, or 25 presets, plus custom sizes from 1 to 50. Reject custom requests above 50.
- Existing round flow: show one flag, let player guess or reveal three hints (capital, currency, first three letters), show answer, advance, show progress and final score, offer replay.
- Guesses use the selected language only. Compare full names after case, diacritics, punctuation, and whitespace normalization; accept known aliases in that language.

## Capabilities and Constraints

- Keep current game flow and prevent repeated flags within a round.
- Use a recently saved country list if REST Countries fails temporarily. REST Countries terms limit retention to three days; after expiration, show a clear retry state.
- Rebuild web in Vite, React, TypeScript, and Tailwind; use Fastify as a small API adapter for REST Countries v5.
- Host web on Netlify and API on Vercel. Keep upstream API key on server, never in browser code.
- Use Vitest unit tests for game logic and API mapping; verify release with tests and build checks.
- Release rebuilt app as v2: `2.0.0` in package versions with matching annotated Git tag `v2.0.0`.
- Repository coding rules: code in English; KISS/DRY; no `any`; files containing functions or classes must not contain written types; explicit type definitions in type-only files; utility behavior in classes with static methods instead of loose utility functions.

## Brand Commitments

Existing game name: Guess Flags. User requested a small design refresh and supplied the live old site as reference. Specific visual choices remain open.

## Evidence on Hand

- Rebuilt app: `apps/web/` and `apps/api/`.
- Live reference: https://guessflags.netlify.app/.
- REST Countries v5 documentation: https://restcountries.com/docs/countries.
- No account or leaderboard flow exists in current app.

## Product Principles

- Start a round quickly.
- Keep each flag and current progress clear.
- Let hints help without blocking a guess.
- Keep answers and feedback consistent with chosen language.
- Keep game playable through a temporary upstream outage.

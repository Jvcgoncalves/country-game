# Guess Flags rebuild plan

## Goal

Rebuild current two-page flag game as an npm workspace monorepo. Use Vite + React + TypeScript + Tailwind for web app, Fastify for small API. Keep REST Countries API key on server. Refresh layout while preserving game flow.

## Current behavior to preserve

- English and Brazilian Portuguese UI and country answers.
- Choose round size, guess country from flag, reveal three hints (capital, currency, first three letters), then show answer.
- Show progress, score, results, and play again.
- Avoid duplicate flags within one game.

## Live preview reference

[Old site](https://guessflags.netlify.app/) uses light gray background, bold condensed headings, green title/buttons, purple round-size control, top-right language flag, and central flag collage. Visual identity and collage treatment await design-round answers. On current live game screen, flag collage remains as placeholder and progress shows no numbers after start. New app needs explicit loading/error states and a real flag before guessing begins.

## Target layout

```text
apps/
  web/                 # Vite + React + TypeScript + Tailwind
  api/                 # Fastify server and REST Countries adapter
package.json           # npm workspaces and root scripts
.env.example           # server-only config names, no real key
```

Browser calls `/api` on Netlify. Netlify proxies those requests to Fastify on Vercel; Vite proxies `/api` to local Fastify during dev. Fastify reads `REST_COUNTRIES_API_KEY` from server env and calls `https://api.restcountries.com/countries/v5` with `Authorization: Bearer ...`. No key in `VITE_*`, web bundle, source control, response, or logs. [Vercel Fastify guide](https://vercel.com/docs/frameworks/backend/fastify) · [Netlify proxy guide](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/)

Fastify returns game-specific rounds rather than a full country data feed. Each question carries only the fields needed for play: code, selected-language answer/aliases, capital/currency hints, and public flag URL derived from alpha-2 code. Server samples without replacement. API owns upstream v5 mapping so future upstream changes stay isolated.

REST Countries v5 list is paginated (`limit` max 100 on free plan). Success payload uses `data.objects` and `data.meta`; errors use `errors`. Fetch pages until `meta.more` is false and request only needed fields. Cache with an absolute expiration no later than three days; Vercel memory alone is not durable. Flag CDN supports direct browser image requests without API key. Confirm exact translation and capital/currency shapes against live v5 data before writing mapper. [Countries API docs](https://restcountries.com/docs/countries) · [Caching and data-use terms](https://restcountries.com/legal/terms-of-service)

## Tasks

### 1. Workspace setup

- [ ] Create npm workspaces, root `dev`, `build`, `lint`, `typecheck`, and `test` scripts; keep old app available until replacement works.
- [ ] Scaffold `apps/web` with Vite React TypeScript; install/configure Tailwind.
- [ ] Scaffold `apps/api` with Fastify; configure dev server, production build/start, and `/api` Vite proxy.
- [ ] Add `.gitignore`, `.env.example`, and README setup instructions for server key, dev ports, builds, Netlify proxy, and Vercel deployment.
- [ ] Honor repository rules: code in English; KISS/DRY; no `any`; explicit type definitions in type-only files; no written types in files with functions or classes; utility behavior in classes with static methods instead of loose utility functions.

### 2. API and v5 migration

- [ ] Check v5 response with demo key, then real server key: names (`names.common`, `names.translations.por`), `codes.alpha_2`, `capitals`, `currencies`, and pagination. Record fixture with no secret.
- [ ] Implement server-only REST Countries client with env validation, request timeout, needed `response_fields`, pagination, and response validation.
- [ ] Map upstream records to stable game DTO; handle missing Portuguese name, capital, currency, or flag code with documented fallback or exclusion.
- [ ] Implement a game-round API route with bounded round size; sample unique countries server-side and return game fields only. Add a small health endpoint.
- [ ] Cache normalized source data with a hard three-day expiration; choose durable storage for Vercel instances and define expired-cache behavior before implementation.
- [ ] If upstream fails while cache is valid, serve saved data; after three-day expiration, stop using it and show retry state.
- [ ] Request REST Countries permission before enabling a custom round spanning the full catalog; keep custom requests bounded until permission is granted.
- [ ] Deduplicate concurrent refreshes and return safe errors when upstream fails.
- [ ] Bound public requests and rate limit API as needed to protect upstream quota; never expose upstream token or raw error details.
- [ ] Add Vitest unit tests for v5 mapping, pagination, missing fields, round sampling, cache expiration, and upstream failures using fixtures/mocks.

### 3. React game migration

- [ ] Build start, game, and results views with React state; keep English/Portuguese copy together and persist chosen language for the round.
- [ ] Request one round from API; show loading, retry, and unavailable states.
- [ ] Offer 5, 10, and 25 flag presets plus custom count; cap custom requests until full-catalog permission is granted, validate against API bounds, and keep score/progress correct.
- [ ] Port guess checking and hint sequence; accept only selected-language full names or known same-language aliases after case, diacritics, punctuation, and whitespace normalization.
- [ ] Reset hints and answer state between flags; support keyboard submit and play again.
- [ ] Use public flag CDN URL built from country code; show image fallback when loading fails.
- [ ] Add Vitest unit tests for answer normalization, hint progression, and end-of-game scoring; add targeted React component tests only for behavior that pure logic tests cannot cover.

### 4. Page refresh

- [ ] Capture old home/game states as visual baseline; use live preview for color/motif reference.
- [ ] Refresh home screen: clearer title, language switch, round-size control, and primary start action.
- [ ] Refresh game screen: real flag in place of collage placeholder, visible progress, clean answer field, hint steps, feedback, and next action.
- [ ] Refresh results screen: score summary and replay action.
- [ ] Use Tailwind for responsive phone/desktop layout, consistent color/type/spacing, focus states, labels, and readable feedback in both languages.
- [ ] Review flag image accessibility without leaking answer before reveal; test keyboard and touch flow.

### 5. Verify and release

- [ ] Run lint, `vitest run`, TypeScript check, and production builds for both apps; run same checks in CI.
- [ ] Manually play full rounds in English and Portuguese on phone and desktop; test bad input, missing data, failed API, hints, results, and replay.
- [ ] Inspect built web assets and network calls: key absent; browser calls only Netlify `/api` route and public flag CDN.
- [ ] Deploy Fastify on Vercel with server secret and Netlify proxy rule for `/api`; verify browser uses same-origin API path and health check.
- [ ] Update README screenshots and usage docs; remove obsolete static files only after new app passes checks.

### 6. v2 release

- [ ] Set root and workspace `package.json` versions to `2.0.0`; document version policy in README. Current README says `1.2.0.0`, and repository has no tags yet.
- [ ] Add v2 release notes covering rebuilt stack, API migration, new design, and known limits.
- [ ] After tests, builds, and production smoke check pass, create annotated Git tag `v2.0.0` on release commit; ensure tag and package versions match, then push tag.

# Guess Flags rebuild plan

## Goal

Rebuild current two-page flag game as an npm workspace monorepo. Use Vite + React + TypeScript + Tailwind for web app, Fastify for small API. Keep REST Countries API key on server. Refresh layout while preserving game flow.

## Current behavior to preserve

- English and Brazilian Portuguese UI and country answers.
- Choose round size, guess country from flag, reveal three hints (capital, currency, first three letters), then show answer.
- Show progress, score, results, and play again.
- Avoid duplicate flags within one game.

## Target layout

```text
apps/
  web/                 # Vite + React + TypeScript + Tailwind
  api/                 # Fastify server and REST Countries adapter
package.json           # npm workspaces and root scripts
.env.example           # server-only config names, no real key
```

Browser calls `/api` on Netlify. Netlify proxies those requests to Fastify on Vercel; Vite proxies `/api` to local Fastify during dev. Fastify reads `REST_COUNTRIES_API_KEY` from server env and calls the REST Countries v5 API with `Authorization: Bearer ...`. No key in `VITE_*`, web bundle, source control, response, or logs.

Fastify returns game-specific rounds rather than a full country data feed. Each question carries only the fields needed for play: code, selected-language answer/aliases, capital/currency hints, and public flag URL derived from alpha-2 code. Server samples without replacement. API owns upstream v5 mapping so future upstream changes stay isolated.

REST Countries v5 list is paginated (`limit` max 100 on free plan); request 50 records per page. Success payload uses `data.objects` and `data.meta`; errors use `errors`. Fetch pages until `meta.more` is false and request only needed fields. Cache with an absolute expiration no later than three days; Vercel memory alone is not durable. Flag CDN supports direct browser image requests without API key. Confirm exact translation and capital/currency shapes against live v5 data before writing mapper.

## Tasks

### 1. Workspace setup

- [x] Create npm workspaces and root `dev`, `build`, `lint`, `typecheck`, and `test` scripts.
- [x] Scaffold `apps/web` with Vite React TypeScript; install/configure Tailwind.
- [x] Scaffold `apps/api` with Fastify; configure dev server, production build/start, and `/api` Vite proxy.
- [x] Add `.gitignore`, `.env.example`, and README setup instructions for the server key, dev ports, builds, Netlify proxy, and Vercel deployment.
- [x] Honor repository rules: code in English; KISS/DRY; no `any`; explicit type definitions in type-only files; no written types in files with functions or classes; utility behavior in classes with static methods instead of loose utility functions.

### 2. API and v5 migration

- [x] Check v5 response with demo key, then real server key: names (`names.common`, `names.translations.por`), `codes.alpha_2`, `capitals`, `currencies`, and pagination. Record fixture with no secret.
- [x] Implement server-only REST Countries client with env validation, request timeout, needed `response_fields`, pagination, and response validation.
- [x] Cap REST Countries page requests at 50 records, below the free-plan maximum of 100.
- [x] Map upstream records to stable game DTO; handle missing Portuguese name, capital, currency, or flag code with documented fallback or exclusion.
- [x] Implement a game-round API route with bounded round size; sample unique countries server-side and return game fields only. Add a small health endpoint.
- [x] Cache normalized source data in Upstash Redis with a hard three-day expiration and defined expired-cache behavior.
- [x] If upstream fails while cache is valid, serve saved data; after three-day expiration, stop using it and show retry state.
- [x] Allow custom rounds up to 50 and reject requests above 50.
- [x] Deduplicate concurrent refreshes across Vercel instances and return safe errors when upstream fails.
- [x] Bound public round size and rate limit requests to protect upstream quota; never expose upstream token or raw error details.
- [x] Add Vitest unit tests for v5 mapping, pagination, missing fields, round sampling, cache expiration, and upstream failures using fixtures/mocks.

### 3. React game migration

- [x] Build start, game, and results views with React state; keep English/Portuguese copy together and persist chosen language for the round.
- [x] Request one round from API; show loading, retry, and unavailable states.
- [x] Offer 5, 10, and 25 flag presets plus custom count; cap custom requests at 50, validate against API bounds, and keep score/progress correct.
- [x] Port guess checking and hint sequence; accept only selected-language full names or known same-language aliases after case, diacritics, punctuation, and whitespace normalization.
- [x] Reset hints and answer state between flags; support keyboard submit and play again.
- [x] Use public flag CDN URL built from country code; show image fallback when loading fails.
- [x] Add Vitest unit tests for answer normalization, hint progression, and end-of-game scoring; add targeted React component tests only for behavior that pure logic tests cannot cover.

### 4. Page refresh

- [x] Refresh home screen: clearer title, language switch, round-size control, and primary start action.
- [x] Refresh game screen: real flag in place of collage placeholder, visible progress, clean answer field, hint steps, feedback, and next action.
- [x] Refresh results screen: score summary and replay action.
- [x] Use Tailwind for responsive phone/desktop layout, consistent color/type/spacing, focus states, labels, and readable feedback in both languages.
- [x] Review flag image accessibility without leaking answer before reveal.
- [ ] Complete keyboard Enter and native touch flow checks; browser automation did not activate Enter and provides no touch input.

### 5. Verify and release

- [x] Remove the legacy static app, local reference artwork, and design previews; keep the workspace code, README, PRODUCT, and this plan.
- [ ] Run lint, `vitest run`, TypeScript check, and production builds for both apps; run same checks in CI.
- [ ] Manually play full rounds in English and Portuguese on phone and desktop; test bad input, missing data, failed API, hints, results, and replay.
- [ ] Inspect built web assets and network calls: key absent; browser calls only Netlify `/api` route and public flag CDN.
- [ ] Deploy Fastify on Vercel with server secret and Netlify proxy rule for `/api`; verify browser uses same-origin API path and health check.
- [ ] Update README usage and deployment details after release verification.

### 6. Tag-triggered production deploys

Use GitHub Actions as the release trigger. Netlify and Vercel Git integrations deploy from branches; the workflow should deploy both projects explicitly when a version tag is pushed.

- [ ] Keep one GitHub repository and two deploy targets: existing Netlify site builds `apps/web` from repository root; Vercel project deploys `apps/api` with workspace files available.
- [ ] Replace `YOUR-VERCEL-API-DOMAIN` in `netlify.toml` with the production API hostname before deploying the new web app.
- [ ] Add a GitHub Actions release workflow triggered only by pushed `v*` tags. Check out the tagged commit, set up Node 22, run `npm ci`, then run lint, tests, type checks, and both production builds before deploying.
- [ ] Validate tag version matches root, web, and API `package.json` versions so a tag always identifies the exact app version being released.
- [ ] Deploy API first with Vercel CLI from `apps/api` using GitHub secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`; then deploy `apps/web/dist` to the existing Netlify production site using Netlify CLI and `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID`.
- [ ] Keep runtime secrets (`REST_COUNTRIES_API_KEY`, Upstash credentials) in Vercel project settings. GitHub Actions needs deploy credentials and project IDs only.
- [ ] Prevent branch pushes from publishing production on either provider; retain preview deploys only if useful. Tag workflow owns production deploys.
- [ ] After each tag deploy, verify the Vercel API health endpoint, Netlify site's `/api/health` proxy, and the deployed tag/commit in both provider dashboards.

### 7. v2 release

- [ ] Set root and workspace `package.json` versions to `2.0.0`; document version policy in README. Current package versions remain `1.2.0`; repository has no tags yet.
- [ ] Add v2 release notes covering the rebuilt stack, API migration, refreshed design, and known limits.
- [ ] After checks pass, create annotated Git tag `v2.0.0` on release commit; ensure tag and package versions match, then push tag to trigger the production deploy workflow above.
- [ ] Run production smoke checks after both deploys finish; fix or roll back release if either service fails.

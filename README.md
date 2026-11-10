# Guess Flags

Flag guessing game. Play in English or Brazilian Portuguese, choose a round length, and use up to three hints to identify each country.

The original static app remains at the repository root while its replacement is built in `apps/web` and `apps/api`.

## Play the existing game

Live site: [guessflags.netlify.app](https://guessflags.netlify.app/)

Choose a language and round size on the start page, then guess each country from its flag. Reveal hints for the capital, currency, and first three letters of the answer. Review your score at the end and play again.

![Existing game start page](https://github.com/Jvcgoncalves/country-game/assets/127047416/f36450f4-6bd2-4326-ad2a-0cafa25b30ca)

![Existing game round size control](https://github.com/Jvcgoncalves/country-game/assets/127047416/c9300016-e04f-431f-ad6d-062275edb232)

![Existing game round](https://github.com/Jvcgoncalves/country-game/assets/127047416/36015dcf-2db7-40de-9908-39665209df31)

## Requirements

- Node.js 22.12 or newer
- npm 10.9 or newer

## Local setup

```sh
npm install
cp .env.example .env
```

Set `REST_COUNTRIES_API_KEY` in `.env` for the API server. Keep it out of `VITE_*` variables and browser code. `API_PORT` defaults to `3001`.

The API uses an in-memory cache during local development when Upstash settings are absent. For Vercel, create an Upstash Redis database and set both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. These credentials stay server-side.

Start both workspaces from the repository root:

```sh
npm run dev
```

The web app runs at `http://localhost:5173`; Fastify runs at `http://localhost:3001`. Vite forwards `/api/*` requests to Fastify.

## Workspace commands

```sh
npm run build
npm run lint
npm run typecheck
npm run test
```

The API build emits JavaScript to `apps/api/dist`; `npm run start --workspace=@guess-flags/api` starts that build. Vitest runs API unit tests from `apps/api/test`.

## API and REST Countries v5

The API exposes `GET /api/health` and `GET /api/round?count=5&language=en`. Round size defaults to 5 and accepts 1–50; requests above 50 are rejected. Language accepts `en` or `pt-BR`.

Round responses contain only each question's country code, selected-language answer and aliases, capital and currency hints, and public flag CDN URL. The REST Countries API key never reaches the web app. The server requests only `names.common`, `names.official`, `names.translations.por`, `codes.alpha_2`, `capitals`, and `currencies`.

The v5 response was checked with its demo key and the configured server key. The server returned 254 records over six pages, requesting at most 50 records per page (the free-plan maximum is 100); pagination metadata lives in `data.meta`, while records live in `data.objects`. Names use `names.common` and `names.translations.por.common` / `.official`. Capital entries are objects with `name` and optional `attributes.primary`; currency entries have `code` and `name`. A secret-free sample is kept in `apps/api/test/fixtures/rest-countries-v5-page.json`.

Records without a valid two-letter alpha-2 code or English common name are excluded. Missing Portuguese names fall back to the English common and official names. Missing capital or currency hints become `null`; a currency code fills in when its display name is absent.

Production stores normalized catalog data in Upstash Redis with a hard 72-hour expiration. The server checks its absolute expiration too. It attempts refresh after 24 hours, serves a still-valid cached catalog if refresh fails, and returns a safe `503` after the 72-hour limit when refresh still fails. A Redis lock deduplicates refreshes across Vercel instances; local development shares refreshes within its server process. `/api/round` is limited to 120 requests per client IP per minute; production rate-limit counters use the shared Redis store.

## Netlify web deployment

The root `netlify.toml` builds `apps/web` and proxies browser `/api/*` requests to the Fastify deployment. After creating the Vercel API project, replace `YOUR-VERCEL-API-DOMAIN` in `netlify.toml` with its production hostname, without `https://` or a trailing slash. Netlify keeps the browser URL on the site while proxying the request.

Import the repository into Netlify with the repository root as the base directory. The build command and publish directory are already in `netlify.toml`.

## Vercel API deployment

Create a separate Vercel project for this repository and set its Root Directory to `apps/api`. Keep the npm workspace root and lockfile available to the build by enabling **Include source files outside of the Root Directory** if Vercel asks. Vercel detects the Fastify entry at `src/server.ts`; leave its framework build settings at their defaults.

Add `REST_COUNTRIES_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` as Vercel server environment variables for the environments where the API runs. Never add these secrets to Netlify or a `VITE_*` variable. After the first deployment, copy the Vercel production hostname into the Netlify proxy rule above.

For local Vercel project setup, run `vercel link --repo` from the repository root and select the API project. Vercel's own deployment instructions: [Fastify](https://vercel.com/kb/guide/ship-a-fastify-app-on-vercel) and [monorepos](https://vercel.com/docs/monorepos).

## Project

- Repository: [Jvcgoncalves/country-game](https://github.com/Jvcgoncalves/country-game)
- Legacy app version: `1.2.0.0`
- Author: João Vitor Gonçalves da Costa
- Contact: goncalvesdacosta05@gmail.com

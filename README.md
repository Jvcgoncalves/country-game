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

Set `REST_COUNTRIES_API_KEY` in `.env` when the server-side REST Countries adapter is enabled. Keep it out of `VITE_*` variables and browser code. `API_PORT` defaults to `3001`.

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

The API build emits JavaScript to `apps/api/dist`; `npm run start --workspace=@guess-flags/api` starts that build. Vitest is configured to pass while no test files exist.

## Netlify web deployment

The root `netlify.toml` builds `apps/web` and proxies browser `/api/*` requests to the Fastify deployment. After creating the Vercel API project, replace `YOUR-VERCEL-API-DOMAIN` in `netlify.toml` with its production hostname, without `https://` or a trailing slash. Netlify keeps the browser URL on the site while proxying the request.

Import the repository into Netlify with the repository root as the base directory. The build command and publish directory are already in `netlify.toml`.

## Vercel API deployment

Create a separate Vercel project for this repository and set its Root Directory to `apps/api`. Keep the npm workspace root and lockfile available to the build by enabling **Include source files outside of the Root Directory** if Vercel asks. Vercel detects the Fastify entry at `src/server.ts`; leave its framework build settings at their defaults.

Add `REST_COUNTRIES_API_KEY` as a Vercel server environment variable for the environments where the API runs. Never add the secret to Netlify or a `VITE_*` variable. After the first deployment, copy the Vercel production hostname into the Netlify proxy rule above.

For local Vercel project setup, run `vercel link --repo` from the repository root and select the API project. Vercel's own deployment instructions: [Fastify](https://vercel.com/kb/guide/ship-a-fastify-app-on-vercel) and [monorepos](https://vercel.com/docs/monorepos).

## Project

- Repository: [Jvcgoncalves/country-game](https://github.com/Jvcgoncalves/country-game)
- Legacy app version: `1.2.0.0`
- Author: João Vitor Gonçalves da Costa
- Contact: goncalvesdacosta05@gmail.com

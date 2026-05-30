# Agent Handoff Notes

## Current Goal

Maintain the Astro migration of `ytkim4558.github.io` and move the deploy target from GitHub Pages-only static hosting toward Cloudflare Pages so Profile Ask can use a server-side LLM endpoint without exposing API keys.

## Repositories

- Source repo: `C:\Users\ytkim\projects\ytkim-astro-site`
- Existing generated GitHub Pages repo: `C:\Users\ytkim\projects\ytkim4558.github.io`

The source repo is the canonical place for Astro code. The generated GitHub Pages repo is still useful for the current live `https://ytkim4558.github.io/` site until Cloudflare Pages and custom domain routing are fully cut over.

## Deployment Decision

The user explicitly prefers Cloudflare Pages over Vercel.

Reasoning:

- GitHub Pages cannot run server code, so browser-side Ask UI must not call OpenAI directly.
- Vercel would work, but Cloudflare Pages keeps the site close to static hosting while adding `/functions` for the small Profile Ask API.
- Latest Astro 6 Cloudflare adapter documentation says adapter-based deployment targets Cloudflare Workers and no longer supports Cloudflare Pages. Therefore this repo should use Astro static output plus Cloudflare Pages Functions, not `@astrojs/cloudflare`.

## Current Cloudflare Pages Setup

- Astro output: static `dist`
- Pages Functions directory: `functions`
- Profile Ask endpoint: `functions/api/profile-chat.js` -> `/api/profile-chat`
- Function route limiting: `public/_routes.json` includes only `/api/*`
- Build command: `npm run build`
- Local Pages preview: `npm run cf:preview`
- Deploy command: `npm run cf:deploy`
- Cloudflare Pages project: `ytkim4558`
- Current Cloudflare Pages URL: `https://ytkim4558.pages.dev/`
- First verified deployment URL: `https://53373cfb.ytkim4558.pages.dev/`

Required Cloudflare Pages secret:

- `GEMINI_PROFILE_API_KEY`

Do not read or reuse a generic `GEMINI_API_KEY` for this site. The user explicitly wants a dedicated Gemini key for the profile assistant, separate from any existing paid/personal Gemini API key.

Optional Cloudflare Pages variable:

- `PROFILE_CHAT_MODEL`, defaults to `gemini-2.5-flash`

Never commit `.dev.vars`, `.env`, API keys, OAuth tokens, or other credentials.

## Verification

Recent checks:

- `npm run build` succeeds.
- `wrangler pages dev dist --port 8788 --ip 127.0.0.1` serves `/profile/` with `Ask Profile`.
- `POST /api/profile-chat` reaches the Pages Function and returns `503` when `GEMINI_PROFILE_API_KEY` is not configured, which is expected. The React UI falls back to local profile answers.
- `npm run cf:deploy` succeeded after loading `CLOUDFLARE_API_TOKEN` from the Windows user environment.
- `https://ytkim4558.pages.dev/profile/` returns 200 and contains `Ask Profile`.
- `https://ytkim4558.pages.dev/api/profile-chat` returns 503 until `GEMINI_PROFILE_API_KEY` is configured in Cloudflare Pages.

## Safety Rules

- In public `ytkim4558` repos, do not introduce the previously flagged forbidden cross-repo string in code, docs, logs, or history.
- Before commit or deploy, run:

```powershell
rg -n -i "<forbidden-string>" . -g "!node_modules/**" -g "!dist/**" -g "!.astro/**" -g "!.wrangler/**"
```

Use the actual forbidden string from prior user instructions when running locally, but avoid writing it into public repo files.

## Next Recommended Work

1. Commit the Cloudflare Pages setup in the source repo.
2. Push the source repo if/when a remote is configured.
3. In Cloudflare dashboard, create/import the Pages project from the source repo.
4. Set `GEMINI_PROFILE_API_KEY` as a Secret.
5. Verify the preview domain, then decide whether to move `ytkim4558.github.io` traffic or keep GitHub Pages as the primary public domain.

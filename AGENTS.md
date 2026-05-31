# Agent Handoff Notes

## Current Goal

Maintain the Astro migration of `ytkim4558.github.io` with Cloudflare Pages as the active deploy target, while keeping the public portfolio content complete, reachable, localized, visually credible, and safe for a public repository.

## Repositories

- Source repo: `C:\Users\ytkim\projects\ytkim-astro-site`
- Existing generated GitHub Pages repo: `C:\Users\ytkim\projects\ytkim4558.github.io`

The Astro source repo is now the canonical repo. The former GitHub Pages static output is preserved only for history/reference. GitHub Actions on `master` should build the Astro site, run validation, and deploy `dist` to Cloudflare Pages.

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
- GitHub Actions workflow: `.github/workflows/cloudflare-pages.yml`

## Site Changes Already Made

The site is no longer the old Jekyll-style GitHub Pages site. It has been migrated into an Astro source tree and should be maintained from this repo.

Major changes already made:

- Rebuilt the public site with Astro pages instead of the former Jekyll output.
- Switched the production deployment path toward Cloudflare Pages while keeping the GitHub repo as the source of truth.
- Added GitHub Actions deployment from `master` to Cloudflare Pages after build and validation.
- Added static Astro routes for Korean, English, and Japanese versions.
- Reworked the top navigation and page hero treatment so portfolio, profile, tag, and post pages share a more consistent layout.
- Added localized tag and post routes, including `/en/...` and `/ja/...` variants.
- Fixed route casing problems such as the `Jekyll.md` slug causing lowercase `/jekyll/` links to 404 on Cloudflare.
- Rebuilt the portfolio as a card-and-modal experience instead of a long wiki-like page.
- Added company/project cards with modal detail behavior for career sections and side projects.
- Restored hidden long-form portfolio records into `src/content/portfolio/details.md` so agents can preserve and reuse detailed resume/project source material.
- Added HotDealppom detail content, including its YouTube embed and screenshot gallery markers, but this still needs real browser click verification because the user reported it was not visibly reachable.
- Added `ProfileAssistant` UI on `/profile/` with local profile fallback answers.
- Added Cloudflare Pages Function `/api/profile-chat` for profile chat LLM responses using the dedicated `GEMINI_PROFILE_API_KEY` secret.
- Added locale, internal link, and content reachability validation scripts under `scripts/`.
- Added AI Workflow posts documenting adaptive layout handoff, content reachability validation, Jekyll/deploy cleanup, session recovery, and related tooling decisions.

Important files for these changes:

- `src/pages/portfolio.astro`
- `src/pages/en/portfolio.astro`
- `src/pages/ja/portfolio.astro`
- `src/content/portfolio/details.md`
- `src/components/ProfileAssistant.tsx`
- `functions/api/profile-chat.js`
- `scripts/validate-locales.mjs`
- `scripts/validate-links.mjs`
- `scripts/validate-content-reachability.mjs`
- `.github/workflows/cloudflare-pages.yml`

Do not remove detailed content just because it is not immediately visible in the summary UI. If content is intentionally hidden from the first screen, it still needs a reachable route, modal target, or explicitly documented hidden-record reason.

Required Cloudflare Pages secret:

- `GEMINI_PROFILE_API_KEY`

Do not read or reuse a generic `GEMINI_API_KEY` for this site. The user explicitly wants a dedicated Gemini key for the profile assistant, separate from any existing paid/personal Gemini API key.

Optional Cloudflare Pages variable:

- `PROFILE_CHAT_MODEL`, defaults to `gemini-2.5-flash`

Never commit `.dev.vars`, `.env`, API keys, OAuth tokens, or other credentials.

## Verification

Recent checks:

- `npm run build` succeeds.
- `npm run validate` succeeds and includes locale, internal link, and content reachability checks.
- `wrangler pages dev dist --port 8788 --ip 127.0.0.1` serves `/profile/` with `Ask Profile`.
- `POST /api/profile-chat` reaches the Pages Function and returns `503` when `GEMINI_PROFILE_API_KEY` is not configured, which is expected. The React UI falls back to local profile answers.
- `npm run cf:deploy` succeeded after loading `CLOUDFLARE_API_TOKEN` from the Windows user environment.
- `https://ytkim4558.pages.dev/profile/` returns 200 and contains `Ask Profile`.
- `GEMINI_PROFILE_API_KEY` was later uploaded as a Cloudflare Pages secret. If the live profile chat fails, verify the secret in Cloudflare first, then test `/api/profile-chat`.

## Safety Rules

- In public `ytkim4558` repos, do not introduce the previously flagged forbidden cross-repo string in code, docs, logs, or history.
- Before commit or deploy, run:

```powershell
rg -n -i "<forbidden-string>" . -g "!node_modules/**" -g "!dist/**" -g "!.astro/**" -g "!.wrangler/**"
```

Use the actual forbidden string from prior user instructions when running locally, but avoid writing it into public repo files.

## Cross-Agent Workflow Rules

This repo should preserve AI workflow lessons in durable files, not only in chat history.

If a future agent handles UI migration, deployment, Cloudflare Pages Functions, profile chat, portfolio content, screenshots, or validation work, it should proactively propose one of the following before the user has to ask:

- update this `AGENTS.md` when the lesson affects future agent behavior;
- add or update an `AI Workflow` post when the lesson is useful as public reasoning or portfolio evidence;
- add a validation script when the issue can recur as a build, route, locale, content reachability, or browser interaction regression;
- add a compact handoff block when work is paused, deployed, or depends on external state such as Cloudflare, GitHub Actions, DNS, or secrets.

Recent workshop/reference material reviewed:

- Claude Code workshop material: useful as a public curated reference for hooks, settings, GitHub Actions, MCP, SDK usage, caching, retry, rate limiting, circuit breaker, structured logging, tracing, and multi-agent patterns. Do not copy slide or snippet content verbatim into this repo. Use official Anthropic documentation and original wording when writing public posts.
- Kiro CLI workshop material: useful for mapping the same ideas into Kiro terms such as steering, custom agents, skills, MCP integration, lifecycle hooks, headless mode, terminal UI, session/context management, and `KIRO_HOME` isolation. Use official Kiro documentation as the technical source when publishing public notes.

Practical rule from both references:

- Steering/agent rules are not enough by themselves. For recurring mistakes, create executable checks.
- Hooks/headless CI should be treated as guardrails for things agents repeatedly miss: forbidden public strings, leaked secrets, broken links, inaccessible content, locale route drift, and modal/browser regressions.
- Context/session tools are portfolio-worthy only when paired with a recovery story: what was hard to find, what metadata was added, how recursion or stale context was avoided, and how another agent can resume without reading raw logs.
- When using third-party workshop repos or slides, treat them as references, not source material. Summarize the learning in original words and cite official docs or the public repo link where appropriate.

## Current Validation Expectations

Before committing or deploying site work, run:

```powershell
npm.cmd run build
npm.cmd run validate
```

`npm run validate` currently covers locale routes, internal links, and content reachability. If a regression requires actual clicking or visual inspection, add a browser-level validation script instead of relying only on static HTML checks.

## Next Recommended Work

1. Verify the HotDealppom portfolio card in a real browser: take a screenshot before/after clicking the card and confirm the modal exposes the detailed text, YouTube embed, and screenshot gallery.
2. Add a browser-level validation script for modal/content visibility if the static content reachability check misses the issue.
3. Re-run `npm.cmd run build`, `npm.cmd run validate`, and the forbidden-string scan before commit.
4. Commit, push `master`, wait for GitHub Actions, and verify the Cloudflare Pages production URL.
5. Turn the validation lesson into an AI Workflow post or update an existing one when the fix is complete.

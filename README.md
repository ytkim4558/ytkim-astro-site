# ytkim-astro-site

Astro site source for `https://ytkim4558.pages.dev/`.

The former GitHub Pages user site at `https://ytkim4558.github.io/` has been disabled. Cloudflare Pages is now the canonical public site.

- Astro static output
- MDX-ready content structure
- React island only where interactivity is needed
- DeKu-inspired readable post layout: stable nav, large hero, narrow article width
- Cloudflare Pages Functions for server-only profile chat calls

## Commands

```powershell
npm install
npm run dev
npm run build
npm run cf:preview
npm run cf:deploy
```

## Cloudflare Pages

Use Cloudflare Pages, not Vercel, for the next deployment target.

- Build command: `npm run build`
- Build output directory: `dist`
- Functions directory: `functions`
- Function route: `/api/profile-chat`
- Function invocation routes: `public/_routes.json` includes only `/api/*`

Set these Cloudflare Pages variables/secrets:

- `GEMINI_PROFILE_API_KEY`: Secret, required for live LLM answers. Use a dedicated Google AI Studio key for this site; do not reuse a general `GEMINI_API_KEY`.
- `PROFILE_CHAT_MODEL`: optional plain variable, defaults to `gemini-2.5-flash`.

Do not put API keys in `PUBLIC_*` variables or commit `.dev.vars`.

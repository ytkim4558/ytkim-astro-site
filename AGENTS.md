# AI Agent Handoff

This repository is the Jekyll source for `https://ytkim4558.github.io/`.

## Repository Roles

- Source repository: `C:\Users\ytkim\projects\GitHubPageMaker`
- Published repository: `C:\Users\ytkim\projects\ytkim4558.github.io`
- Public site: `https://ytkim4558.github.io/`

Do not edit generated HTML first unless explicitly asked. Update the Jekyll source here, build into `output/`, then copy the generated output into the published repository.

## Build

Windows local Ruby is not assumed to exist. Use Docker with Ruby 3.2 and Bundler 2.6.9:

```powershell
docker run --rm `
  -v jekyll_bundle_232_ruby32_bundler269:/usr/local/bundle `
  -v "C:\Users\ytkim\projects\GitHubPageMaker:/srv/jekyll" `
  -w /srv/jekyll `
  ruby:3.2 `
  bash -lc "bundle _2.6.9_ exec jekyll build --future"
```

`--future` is intentional. Same-day posts can otherwise be skipped because of container timezone differences.

## Publish

After a successful build, copy the generated files:

```powershell
$source = "C:\Users\ytkim\projects\GitHubPageMaker\output"
$target = "C:\Users\ytkim\projects\ytkim4558.github.io"
Get-ChildItem -LiteralPath $source -Force | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $target -Recurse -Force
}
```

Then commit and push both repositories.

## Current Context

- Navigation was refreshed from the old `jekyll/mysql/git/android` menu to current portfolio categories.
- `AI Workflow` tag contains posts about `claude-resume`, `codex-resume`, and site maintenance work.
- `codex-resume` screenshots are stored under `assets/images/codex-resume/`.
- Public screenshot copies must be redacted before publishing. Avoid exposing VR-specific personal context, local file paths, private filenames, account tokens, or raw session IDs unless already intentionally public.
- Dependabot alerts were resolved by removing `jekyll-tasks`, updating `github-pages` to `~> 232`, and pinning `nokogiri >= 1.19.3`.

## Post Cover Rules

- Do not leave new posts on the generic `assets/images/blog-cover.jpg` unless there is no better topic image.
- Use a cover image that explains the post before the user reads it.
- Prefer first-party assets: redacted screenshots, generated diagrams, or simple custom cover images created for the post.
- For tool posts, prefer an actual redacted screenshot of the tool.
- For Jekyll/site maintenance posts, prefer Jekyll or site-related imagery, or generate a custom cover that summarizes the maintenance result.
- If using an external image, use only clearly license-free sources such as Openverse, Wikimedia Commons, Unsplash, or Pexels. Verify the license/source page before committing.
- Record external image attribution near the post or in a nearby asset note when the license requires it.
- If a screenshot includes private context, create a redacted copy under `assets/images/<topic>/` and use that copy as the cover.
- After changing `cover:`, rebuild and verify the post page, home card, tag page, and Open Graph metadata.

## Linking Rules

- When a tool, repository, or highlighted project name appears as a key term, link the name itself.
- At minimum, link the first meaningful mention and any section heading or summary bullet where the name is highlighted.
- Prefer repository links for project names and documentation links for "design doc" or "wiki" labels.
- Avoid leaving highlighted names such as `claude-resume`, `codex-resume`, or `claude-toolkit` as plain text when the reader would reasonably expect to click them.
- Do not link every repeated occurrence in the same paragraph; keep links useful rather than noisy.

## Portfolio Media Rules

- Avoid long vertical stacks of screenshots in `portfolio/index.md`.
- When a project has multiple screenshots, use a horizontal `.portfolio-gallery` scroll-snap block so desktop and mobile readers can swipe/scroll through the set.
- Each gallery item should link to the original image and include a specific `alt` text.
- Use `.portfolio-gallery-wide` for landscape desktop or web screenshots and the default `.portfolio-gallery` for phone-shaped screenshots.
- Keep the gallery CSS in both `assets/css/screen.edited.css` and `assets/built/screen.edited.css` unless the CSS build pipeline is restored.

## Bilingual Site Rules

- Keep Korean pages as the primary archive and add English counterparts under `/en/` incrementally.
- Add a visible top navigation language switch instead of hiding language selection deep in the menu.
- For Korean pages, the switch should point to the matching English page when it exists, otherwise `/en/`.
- For English pages, the switch should point back to the matching Korean page when it exists, otherwise `/`.
- When creating LinkedIn drafts or public summaries, provide Korean and English versions together unless the user explicitly asks for only one language.
- Do not rewrite GitHub links to a fake mobile URL. GitHub uses responsive `github.com` pages, so keep canonical GitHub URLs and let GitHub handle mobile rendering.
- For portfolio interactions, prefer lightweight CSS/vanilla JS effects: hover lift, cursor-follow glow, scroll-snap galleries, and subtle reveal animation.
- Always include a `prefers-reduced-motion: reduce` fallback when adding animation.
- Keep `/profile/` as the one-link share page for people who need a quick summary. It should explain who Yongtak Kim is, what he works on, selected projects, and contact links without requiring readers to understand the blog structure first.
- Keep the root page `/` shareable as the easiest URL to remember. The first screen should summarize the profile before showing blog/navigation content.
- Preserve the user's language choice across navigation with `localStorage` when matching English/Korean pages exist. Do not redirect content that has no translated counterpart.
- Do not expose LLM API keys in GitHub Pages. Any "ask about me" feature on the static site must use local public-profile facts or require a separate backend before calling a real LLM.
- Avoid making the portfolio feel like a numbered resume by default. Lead with curated selected work; put long career history behind a detailed resume/archive interaction.

## AI Workflow Writing Rule

- When an AI agent fixes a non-trivial bug, deployment issue, security alert, UI regression, build failure, or workflow problem, decide whether the process is worth documenting.
- If the fix includes reusable reasoning, tradeoff decisions, tooling choices, or verification steps, create or update an `AI Workflow` post.
- Good candidates: Dependabot cleanup, Jekyll build recovery, screenshot redaction, TUI library decision, portfolio navigation fixes, agent handoff rules.
- Bad candidates: one-line typo fixes, purely cosmetic copy edits, or changes with no reusable lesson.
- The post should explain the trigger, failed or rejected options, final decision, exact verification, and any rule added to `AGENTS.md`.
- Prefer publishing the workflow note near the actual code change so future agents can follow the decision trail.

## Cross-Agent Handoff Rule

- When work may be resumed by another AI agent, another account, another session, another device, or another tool, leave a concrete handoff note instead of relying on chat memory.
- "Another agent" can mean Claude, ChatGPT, Codex, GitHub Copilot, the same agent in a later session, the same agent under another account, or a human using one of them.
- Use `AGENTS.md` for repo-level handoff rules and local Codex skills for reusable behavior across sessions.
- Record source repo, generated/live repo, exact build command, publish command, verification command, and any CDN/cache delay.
- Distinguish what is already committed/pushed from what is only local.
- Include sensitive-data handling rules, especially for screenshots, local paths, tokens, private filenames, or raw session IDs.
- If the handoff is intended for Claude, ChatGPT, another account, or a later session, provide a compact copy-paste block that does not assume access to prior chat history.
- If the handoff process itself becomes useful or repeatable, document it as an `AI Workflow` post.
- Local reusable skill: `C:\Users\ytkim\.codex\skills\agent-handoff\SKILL.md`.

## New Agent Onboarding Response

When a user or agent asks "I'm new to this codebase", "이 프로젝트 설명해줘", or needs a fresh orientation, respond with a high-level overview before diving into files.

Use this structure:

1. Purpose: what this repository is for and what public URL or tool it produces.
2. Architecture: source repo, generated/live repo, layouts, includes, pages, posts, assets, and build output.
3. Key workflows: edit source, build with Docker, copy output, commit/push both repos.
4. Current features: bilingual `/en/` section, top language switch, tag index, post tag panels, portfolio galleries, AI Workflow posts, redacted screenshots.
5. Technology stack: Jekyll, Jasper2-derived layouts, Liquid, Markdown, CSS, small vanilla JS, Docker Ruby build.
6. Safety rules: do not edit generated HTML first, redact screenshots, keep canonical GitHub links, avoid fake mobile URLs, preserve Korean primary archive.
7. Where to start: `AGENTS.md`, `_includes/navigation.html`, `_layouts/default.html`, `portfolio/index.md`, `en/`, `_posts/`, `assets/css/screen.edited.css`.

Keep this response concise and scannable, like a codebase briefing, not a file-by-file dump.

## Verification Checklist

Check these after publishing:

```powershell
Invoke-WebRequest -Uri "https://ytkim4558.github.io/portfolio/" -UseBasicParsing
Invoke-WebRequest -Uri "https://ytkim4558.github.io/codex-resume-tui-decision" -UseBasicParsing
Invoke-WebRequest -Uri "https://ytkim4558.github.io/jekyll-dependabot-cleanup" -UseBasicParsing
Invoke-WebRequest -Uri "https://ytkim4558.github.io/tag/ai-workflow/" -UseBasicParsing
```

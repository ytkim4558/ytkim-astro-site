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

## Verification Checklist

Check these after publishing:

```powershell
Invoke-WebRequest -Uri "https://ytkim4558.github.io/portfolio/" -UseBasicParsing
Invoke-WebRequest -Uri "https://ytkim4558.github.io/codex-resume-tui-decision" -UseBasicParsing
Invoke-WebRequest -Uri "https://ytkim4558.github.io/jekyll-dependabot-cleanup" -UseBasicParsing
Invoke-WebRequest -Uri "https://ytkim4558.github.io/tag/ai-workflow/" -UseBasicParsing
```


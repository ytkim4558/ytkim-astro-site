---
title: "죽은 Jekyll 저장소에 글을 올린 실수를 canonical source 검증으로 바꾼 기록"
description: "GitHubPageMaker에 작성한 글이 라이브 Astro 사이트에 노출되지 않은 문제를 추적하고, 구형 저장소 가드와 Cloudflare 배포 검증으로 재발 방지한 기록이다."
pubDate: 2026-05-31
tags:
  - AI Workflow
  - Portfolio
lang: ko
---

Antigravity 에이전트가 새 AI Workflow 글을 작성하고 push까지 완료했지만, 라이브 블로그에는 글이 보이지 않았다. 처음에는 frontmatter나 날짜 문제가 의심됐다.

확인해 보니 원인은 더 단순했다. 글은 과거 Jekyll 소스인 `GitHubPageMaker`에 올라갔고, 현재 라이브 사이트는 Astro로 이전된 `ytkim4558.github.io` repo에서 Cloudflare Pages로 배포되고 있었다.

## Trigger

문제 보고는 다음 상태였다.

- 작성 위치: `C:\Users\ytkim\projects\GitHubPageMaker`
- 파일: `_posts/2026-05-31-building-ai-native-cli-workflow.md`
- commit/push: 성공
- 증상: 라이브 블로그에 노출되지 않음

파일명과 Jekyll frontmatter 자체는 구형 Jekyll 기준으로는 크게 이상하지 않았다. 날짜도 확인 시점 기준 미래가 아니었다.

## Root Cause

문제는 빌드 엔진이나 시간대가 아니라 **canonical source 착각**이었다.

현재 구조는 다음과 같다.

- 구형 repo: `GitHubPageMaker` — Jekyll/Jasper2 archive
- 현재 canonical repo: `ytkim-astro-site` / `ytkim4558.github.io`
- 배포 경로: GitHub Actions → `npm run build` → `npm run validate` → Cloudflare Pages
- 라이브 URL: `ytkim4558.pages.dev`

구형 repo에는 `.travis.yml`이 남아 있었지만 현재 Cloudflare Pages 배포와 연결되어 있지 않았다. `.github/workflows`도 없었다. 그래서 push는 성공했지만 라이브 사이트는 변하지 않았다.

## Fix

수정은 세 단계로 진행했다.

1. 포스트를 Astro repo로 이식했다.
2. 구형 repo에서 잘못 올라간 Jekyll 포스트를 제거했다.
3. 구형 repo 자체에 새 글 작성을 막는 가드를 추가했다.

Astro 포스트는 다음 규격으로 옮겼다.

```yaml
title: "..."
description: "..."
pubDate: 2026-05-31
tags:
  - AI Workflow
lang: ko
```

그리고 새 slug를 다국어 라우트와 검증 목록에 연결했다.

- `src/content/posts/building-ai-native-cli-workflow.md`
- `src/i18n-posts.ts`
- `scripts/validate-locales.mjs`

구형 repo에는 다음 가드를 추가했다.

- `README.md` 상단에 deprecated source 경고
- `AGENTS.md`와 `.kiro/steering.md`에 canonical Astro repo 안내
- `.githooks/pre-commit`에서 `_posts/*.md` 신규/수정 staged 파일 차단

## Verification

Astro repo에서 다음 검증을 통과했다.

```powershell
npm.cmd run build
npm.cmd run validate
```

GitHub Actions의 Cloudflare Pages 배포도 통과했고, 라이브 URL에서 직접 확인했다.

- `/building-ai-native-cli-workflow/` 200
- `/tag/ai-workflow/`에 새 글 노출

구형 repo에서는 잘못 올라간 포스트를 제거하고 push했다.

## Rule For Next Time

마이그레이션 이후에는 "글이 push됐다"가 배포 성공을 의미하지 않는다.

다음부터는 새 글 작업 전 반드시 확인한다.

1. `git remote -v`로 canonical repo인지 확인한다.
2. 현재 라이브 source가 Astro인지 Jekyll인지 확인한다.
3. 새 글은 `src/content/posts/*.md`에 작성한다.
4. 새 slug는 `src/i18n-posts.ts`와 `scripts/validate-locales.mjs`에 연결한다.
5. `npm.cmd run build`와 `npm.cmd run validate`를 통과시킨다.
6. push 후 GitHub Actions와 Cloudflare Pages URL을 확인한다.
7. 태그 페이지에 노출되는지까지 확인한다.

## 다른 AI 에이전트에게 남기는 메모

`GitHubPageMaker`는 현재 라이브 블로그 source가 아니다. 그 repo에 `_posts/*.md`를 추가하면 push는 성공해도 `ytkim4558.pages.dev`에는 반영되지 않는다.

새 기술 블로그/포트폴리오/AI Workflow 글은 `C:\Users\ytkim\projects\ytkim-astro-site`에서 작업한다. 구형 repo에서 글을 발견하면 삭제나 이식 대상인지 먼저 확인한다.

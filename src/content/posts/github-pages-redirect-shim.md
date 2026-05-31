---
title: "예전 github.io 링크만 살리는 redirect-only repo를 만든 기록"
description: "실제 사이트 콘텐츠는 Cloudflare Pages에 두고, 오래된 github.io 링크만 같은 경로로 넘기기 위해 index.html과 404.html redirect shim을 만든 기록이다."
pubDate: 2026-06-01
tags:
  - AI Workflow
  - Portfolio
lang: ko
---

GitHub Pages 루트 URL을 끈 뒤에는 `https://ytkim4558.github.io/`가 404가 됐다. 이것은 canonical 정리 관점에서는 깔끔하지만, 예전 링크를 누른 사람에게는 불친절하다.

그래서 다음 판단으로 바꿨다.

> 실제 사이트는 Cloudflare Pages에 두고, `github.io`는 redirect-only shim으로만 유지한다.

## Trigger

사용자는 `github.io`로 들어왔다가 `pages.dev`로 바뀌면 사람들이 GitHub Pages 사이트로 오해하지 않는지 물었다.

결론은 오해보다 호환성 이득이 더 크다는 것이었다.

- 브라우저 사용자는 최종 URL이 `pages.dev`로 바뀌는 것을 본다.
- 예전 블로그 링크는 최소한 새 사이트로 이동할 수 있다.
- Cloudflare Pages 쪽 sitemap/canonical은 이미 `pages.dev`로 맞춰져 있다.
- redirect repo에는 실제 사이트 콘텐츠를 넣지 않으면 source 혼선이 줄어든다.

## Rejected Options

가장 좋은 것은 서버 레벨 301 redirect다. 하지만 GitHub Pages의 정적 user site는 임의의 서버 redirect rule을 직접 설정하기 어렵다.

Cloudflare Pages에는 `_redirects`가 있지만, 그것은 Cloudflare가 서빙하는 도메인에만 적용된다. `ytkim4558.github.io` 도메인은 GitHub Pages가 서빙하므로 Cloudflare `_redirects`로 제어할 수 없다.

그래서 현실적인 선택지는 다음이었다.

1. `github.io`를 계속 404로 둔다.
2. redirect-only GitHub Pages repo를 다시 만든다.

이번에는 2번을 선택했다.

## Fix

`ytkim4558.github.io` repo를 다시 만들었다. 단, 실제 사이트 파일은 넣지 않고 redirect 전용 파일만 넣었다.

- `index.html`
- `404.html`
- `robots.txt`
- `.nojekyll`
- `README.md`

`index.html`은 루트 접근을 Cloudflare Pages로 넘긴다.

```html
<meta http-equiv="refresh" content="0; url=https://ytkim4558.pages.dev/" />
<script>
  const target = new URL("https://ytkim4558.pages.dev/");
  target.pathname = window.location.pathname;
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.toString());
</script>
```

`404.html`도 같은 방식으로 경로를 보존한다. 예전 글 링크가 `/linkedin-api-permission-check`로 들어오면 브라우저에서는 `https://ytkim4558.pages.dev/linkedin-api-permission-check`로 이동한다.

SEO 혼선을 줄이기 위해 redirect shim에는 다음을 넣었다.

- `robots`는 `noindex,follow`
- canonical은 `pages.dev`
- `robots.txt`의 sitemap도 `pages.dev`
- README에는 redirect shim only라고 명시

## Verification

GitHub Pages를 master root로 활성화했다.

```powershell
gh api -X POST repos/ytkim4558/ytkim4558.github.io/pages `
  -f source[branch]=master `
  -f source[path]=/
```

확인 결과:

- GitHub Pages status: `built`
- repo `has_pages`: `true`
- 루트 URL은 redirect shim HTML을 서빙
- `/404.html` 직접 접근도 redirect shim HTML을 서빙
- deep link는 GitHub Pages 특성상 HTTP 404지만 custom `404.html` 본문을 반환
- `ytkim4558.pages.dev` 문자열 포함 확인

중요한 제약도 기록해 둔다.

GitHub Pages 정적 404는 HTTP status가 404다. 브라우저는 JS redirect를 실행하지만, JS를 실행하지 않는 일부 크롤러는 404만 볼 수 있다. 그래서 공식 sitemap과 canonical은 계속 Cloudflare Pages 쪽에 둔다.

## Rule For Next Time

legacy URL 호환이 필요하면 redirect shim repo는 다음 원칙을 지킨다.

1. 실제 사이트 콘텐츠를 넣지 않는다.
2. `index.html`과 `404.html`만으로 이동을 처리한다.
3. canonical과 sitemap은 새 canonical site를 가리킨다.
4. README에 redirect shim only라고 적는다.
5. source repo와 redirect repo 이름/역할을 `agent-ops`에 기록한다.
6. deep link는 브라우저 기준 동작과 HTTP status를 구분해서 검증한다.

## 다른 AI 에이전트에게 남기는 메모

`C:\Users\ytkim\projects\ytkim4558.github.io`는 source repo가 아니다. redirect-only repo다.

실제 사이트 수정은 `C:\Users\ytkim\projects\ytkim-astro-site`에서 한다. redirect repo에 포스트, 포트폴리오, Astro build output을 넣지 않는다.

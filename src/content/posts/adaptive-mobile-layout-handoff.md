---
title: "GitHub Pages 포트폴리오 모바일 레이아웃을 적응형으로 정리한 이유"
description: "ytkim4558.github.io의 포트폴리오와 AI Workflow 글 상세 페이지를 보다가 상단 레이아웃이 서로 맞지 않는 문제가 드러났다."
pubDate: 2026-05-30
tags:
  - AI Workflow
lang: ko
---

`ytkim4558.github.io`의 포트폴리오와 AI Workflow 글 상세 페이지를 보다가 상단 레이아웃이 서로 맞지 않는 문제가 드러났다.

문제는 단순히 이미지가 마음에 들지 않는 수준이 아니었다. `/en/portfolio/`는 큰 포트폴리오 히어로와 별도의 cover 이미지가 겹쳐 보였고, `/linkedin-api-permission-check` 같은 글 상세 페이지는 상단에 비어 보이는 영역이 생겼다. `/tag/ai-workflow/`는 또 다른 방식으로 큰 헤더와 카드 목록이 이어져 전체 사이트가 한 벌의 UI처럼 보이지 않았다.

## 처음 놓친 것

처음에는 CSS 몇 줄로 상단 여백과 cover 이미지를 줄이면 된다고 봤다.
하지만 그 접근은 부족했다.

1. 공개 URL은 로컬 수정만으로 바뀌지 않는다.
2. 이 블로그는 `GitHubPageMaker` 소스 repo와 `ytkim4558.github.io` 배포 repo가 분리되어 있다.
3. 정식 반영은 Docker 기반 Jekyll build 후 `output/`을 배포 repo로 복사해야 한다.
4. 기존 repo에는 이미 "다른 AI 에이전트에게 남기는 메모"와 cross-agent handoff 규칙이 있었다.

특히 4번을 바로 찾지 못한 것이 이번 작업의 핵심 실수였다.
`AGENTS.md`만 보고 멈추지 말고, `_posts/`와 git history에서 기존 인수인계 패턴을 먼저 검색했어야 했다.

## 반응형과 적응형 중 무엇을 골랐나

처음에는 일반적인 반응형 수정을 생각했다.
하지만 이 사이트는 이미 Jasper2 기반 데스크톱 레이아웃 위에 포트폴리오 히어로, 태그 페이지, 글 상세 스타일이 여러 겹 쌓인 상태였다.

단순 반응형은 하나의 레이아웃을 유동적으로 줄이는 방식에 가깝다.
반면 적응형은 특정 화면 폭에서 별도 레이아웃을 주는 방식에 가깝다.

이 사이트에는 둘을 섞는 방식이 맞다.

- 본문, 이미지, 카드 목록은 반응형으로 둔다.
- 글 상세 상단, 태그 상단, 포트폴리오 히어로는 모바일에서 적응형 레이아웃처럼 따로 잡는다.

검색으로도 이 판단을 보강했다.

- [web.dev Responsive web design basics](https://web.dev/responsive-web-design-basics/)는 모바일 페이지에 viewport meta가 필요하고, viewport보다 넓은 콘텐츠가 가로 스크롤을 만들면 나쁜 사용자 경험이라고 설명한다.
- [web.dev Learn Design introduction](https://web.dev/learn/design/intro)은 adaptive layout을 media query와 fixed-width layout의 조합으로, responsive design을 media query와 liquid layout의 조합으로 설명한다.
- [MDN CSS media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries)는 viewport size 기준 media query가 서로 다른 화면 크기에 다른 레이아웃을 주는 핵심 도구라고 설명한다.

그래서 최종 선택은 "모바일 적응형 레이어를 가진 반응형 사이트"다.

## 실제 수정 방향

`_layouts/default.html`에는 이미 다음 viewport meta가 있었다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

따라서 기기의 가로폭을 읽는 기본 설정은 있었다.
문제는 CSS였다. 데스크톱 기준의 큰 width, hero, title 규칙이 모바일에서도 남아 있었다.

수정은 다음 방향으로 진행했다.

- `@media (max-width: 600px)`를 모바일 적응형 구간으로 본다.
- `.post-full-header`, `.post-full-image`, `.post-full-content`, `.portfolio-hero`, `.portfolio-metrics`, `.portfolio-toc`는 데스크톱 부모 폭을 상속하지 않게 한다.
- 모바일에서는 주요 블록을 `calc(100vw - ...)` 기준으로 viewport 안에 고정한다.
- 긴 한국어/영문 혼합 제목은 모바일에서 더 작은 고정 크기와 줄바꿈 규칙을 사용한다.
- 포트폴리오 페이지는 자체 hero가 있으므로 generic page cover figure와 `Portfolio` 중복 제목을 숨긴다.

## 빌드와 확인

Docker Desktop은 설치되어 있었지만 처음에는 `docker-desktop` WSL 배포판이 stopped 상태였다.
그래서 Docker Desktop을 실행한 뒤 `docker info`가 성공하는 것을 확인하고, Ruby 3.2 컨테이너로 Jekyll build를 돌렸다.

```powershell
docker run --rm `
  -v jekyll_bundle_232_ruby32_bundler269:/usr/local/bundle `
  -v "C:\Users\ytkim\projects\GitHubPageMaker:/srv/jekyll" `
  -w /srv/jekyll `
  ruby:3.2 `
  bash -lc "bundle _2.6.9_ exec jekyll build --future"
```

빌드 후 `output/`을 `C:\Users\ytkim\projects\ytkim4558.github.io`로 복사했다.

검증은 Chrome headless 캡처로 진행했다.

- `http://127.0.0.1:8008/linkedin-api-permission-check.html`
- `http://127.0.0.1:8008/en/portfolio/`
- `http://127.0.0.1:8008/tag/ai-workflow/`

## 규칙으로 남긴 것

이번 작업에서 중요한 것은 CSS 자체보다 다음 규칙이다.

1. 공개 GitHub Pages URL을 보고 "안 바뀐다"고 판단하지 않는다. 로컬 수정, build output, 배포 repo, 원격 GitHub Pages는 서로 다른 상태다.
2. UI/배포/빌드 의사결정이 생기면 `AGENTS.md`만 보지 말고 `_posts/`와 git history의 기존 인수인계 패턴을 검색한다.
3. 사용자가 "왜 이 선택을 했는지 기록하라"고 말하기 전에, 비슷한 작업이면 AI Workflow 글 또는 handoff block을 먼저 제안한다.
4. 이 규칙은 공개 repo 전반에 적용한다.
5. 사용자가 중간에 새 지시를 해도 진행 중이던 build, copy, verification, cleanup 단계를 버리지 않는다. 새 지시는 작업 큐에 끼워 넣고, 끊긴 단계는 다시 이어간다.

## 다른 AI 에이전트에게 남기는 메모

이 작업을 이어받는 AI 에이전트는 이 사이트를 단순한 반응형 CSS 문제로 보지 말고, **소스 repo와 배포 repo가 분리된 Jekyll 정적 사이트의 모바일 적응형 레이아웃 작업**으로 봐야 한다.

- 소스 repo: `C:\Users\ytkim\projects\GitHubPageMaker`
- 배포 repo: `C:\Users\ytkim\projects\ytkim4558.github.io`
- 모바일 레이아웃 최종 오버라이드는 `assets/css/screen.edited.css`와 `assets/built/screen.edited.css` 둘 다에 있어야 한다.
- build는 Docker Ruby 3.2와 Bundler 2.6.9 기준으로 한다.
- Docker가 실패하면 먼저 Docker Desktop이 켜져 있는지와 `docker info`를 확인한다.
- 공개 URL은 commit/push 후 GitHub Pages 반영까지 시간이 걸릴 수 있다.
- 다음에 비슷한 의사결정이 생기면 먼저 `rg -n "인수인계|handoff|다른 AI 에이전트|Cross-Agent|AI Workflow" .`와 `git log --all --grep=handoff --grep=인수인계 --grep=agent --oneline --decorate --max-count=30`를 실행한다.


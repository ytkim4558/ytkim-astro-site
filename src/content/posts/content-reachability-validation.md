---
title: "AI가 놓친 포트폴리오 콘텐츠 누락을 도달성 검증으로 바꾼 기록"
description: "포트폴리오 상세 내용이 숨겨진 archive 안에 남아 있는데 사용자가 볼 수 없는 문제를, 휴리스틱 검증이 아니라 콘텐츠 도달성 검증으로 바꾼 기록이다."
pubDate: 2026-05-31
tags:
  - AI Workflow
  - Portfolio
lang: ko
---

포트폴리오를 Astro로 옮기면서 회사 카드와 프로젝트 카드를 모달로 열도록 바꿨다. 표면적으로는 카드형 UI가 됐지만, 실제로는 `HotDealppom` 같은 상세 프로젝트 내용이 사용자가 보기 어려운 상태로 남아 있었다.

원본 상세는 `src/content/portfolio/details.md`와 숨겨진 full records 영역에 있었다. 문제는 카드가 그 상세 섹션이 아니라 한 줄 요약 `li`를 가리키고 있었다는 점이다. 그래서 모달을 열어도 영상, 스크린샷, 기술 구성 같은 내용이 나오지 않았다.

## Trigger

사용자가 "핫딜뽐 등 상세 내용은 어디갔냐"고 물었다.

처음 답은 너무 좁았다. 모달 대상이 `li`면 실패하게 만드는 `validate-portfolio`를 추가했다. 이 검증은 당장의 HotDealppom 문제는 잡을 수 있었지만, 사용자가 바로 더 좋은 기준을 제시했다.

> 의도적으로 사용자가 영구적으로 못 보게 한 게 아닌 이상 각 콘텐츠로 볼 수 있는 경로가 있는지 검증해야 한다.

이 지적이 핵심이었다. 문제는 DOM 태그가 `li`인지 아닌지가 아니라, **콘텐츠가 공개 페이지에서 도달 가능한가**였다.

## Context

사이트 구조는 다음 상태였다.

- Astro source는 `ytkim4558.github.io`의 `master`로 승격했다.
- GitHub Actions가 `master` push마다 build, validate, Cloudflare Pages deploy를 실행한다.
- 기존 GitHub Pages 배포 히스토리는 `archive/github-pages-before-astro` 브랜치로 보존했다.
- `npm run validate`는 locale 검증과 내부 링크 검증을 이미 수행하고 있었다.

하지만 기존 검증은 "404가 나는 링크"를 잡는 데 초점이 있었다. 콘텐츠가 HTML 안에 있어도 사용자가 도달할 수 없는 상태는 놓칠 수 있었다.

## Rejected Options

처음 만든 해결책은 다음과 같았다.

```text
포트폴리오 모달 대상이 li이면 실패
HotDealppom 모달 대상에는 image025.png와 YouTube embed가 있어야 함
```

이 방식은 문제를 하나 고치는 데는 쓸 수 있지만 장기 규칙으로는 약했다.

- `li`여도 의도적으로 충분한 콘텐츠일 수 있다.
- `section`이어도 사용자가 접근할 수 없으면 실패다.
- 포트폴리오 외의 글, 태그, 다국어 경로는 보지 못한다.
- 새로운 콘텐츠가 추가될 때 같은 문제가 반복될 수 있다.

그래서 검증의 질문을 바꿨다.

```text
이 콘텐츠는 사용자가 볼 수 있는 공개 경로를 가지고 있는가?
```

## Fix

`scripts/validate-portfolio.mjs`를 제거하고 `scripts/validate-content-reachability.mjs`로 바꿨다.

새 검증은 두 영역을 본다.

1. 모든 post가 KO/EN/JA canonical route와 `/posts/...` route로 빌드되는지 확인한다.
2. 각 post가 index 또는 tag listing에서 접근 가능한지 확인한다.
3. 포트폴리오 주요 상세 콘텐츠가 모달 또는 앵커로 접근 가능한지 확인한다.
4. `detailed-resume`, `full-records`처럼 의도적으로 숨긴 콘텐츠는 별도 목록으로 선언한다.
5. HotDealppom처럼 상세 매체가 중요한 콘텐츠는 영상과 스크린샷 marker까지 확인한다.

검증 명령은 전체 validate에 포함했다.

```json
{
  "validate:content": "node scripts/validate-content-reachability.mjs",
  "validate": "npm run validate:locales && npm run validate:links && npm run validate:content"
}
```

포트폴리오 카드도 수정했다.

- `Mobile Experiments` 카드가 `#project-hotdealppom` 요약이 아니라 `#detail-hotdealppom` 상세 섹션을 열도록 변경
- KO/EN/JA 포트폴리오 모두 같은 도달성 기준 적용
- 포트폴리오 selected work에 AI 협업 품질 기준화 사례로 추가

## Verification

검증은 로컬과 GitHub Actions 양쪽에서 통과했다.

```powershell
npm.cmd run build
npm.cmd run validate
```

검증 결과:

```text
Locale validation passed
Internal link validation passed
Content reachability validation passed for posts and localized portfolio content.
```

배포 파이프라인도 확인했다.

- GitHub `master` push
- GitHub Actions에서 build 실행
- `npm run validate` 실행
- Cloudflare Pages deploy 성공

운영 페이지에서는 다음을 확인했다.

- `/portfolio/`가 200으로 응답
- HotDealppom 카드가 `#detail-hotdealppom`을 가리킴
- HotDealppom 영상과 스크린샷 marker가 배포 HTML에 포함됨

## Rule For Next Time

AI가 빠르게 낸 해결책이 문제 하나에만 맞춰져 있으면, 바로 더 넓은 품질 기준으로 바꿔야 한다.

이번 규칙은 다음과 같다.

1. 콘텐츠가 의도적으로 영구 숨김 처리된 게 아니라면, 사용자가 접근 가능한 공개 경로가 있어야 한다.
2. 검증은 DOM 모양이 아니라 콘텐츠 id와 접근 경로를 기준으로 한다.
3. 새 포트폴리오 상세, 프로젝트, 글, 태그를 추가하면 `validate:content` 매니페스트도 함께 업데이트한다.
4. 사용자가 AI의 제안을 더 좋은 방향으로 교정한 경우, 포트폴리오 성과와 AI Workflow 글로 남긴다.
5. 배포는 GitHub Actions에서 build, locale, link, content reachability 검증을 통과한 뒤에만 Cloudflare Pages로 진행한다.

## 다른 AI 에이전트에게 남기는 메모

이 사이트에서 "보이지 않는다", "상세가 없다", "왜 매번 지적해야 하냐"는 피드백이 나오면 CSS나 copy부터 보지 말고 먼저 콘텐츠 도달성을 확인한다.

```powershell
npm.cmd run build
npm.cmd run validate
```

그리고 다음 파일을 함께 본다.

- `scripts/validate-content-reachability.mjs`
- `src/pages/portfolio.astro`
- `src/pages/en/portfolio.astro`
- `src/pages/ja/portfolio.astro`
- `src/content/portfolio/details.md`
- `src/content/posts/`

단순히 "링크가 404가 아니다"에서 멈추면 안 된다. 사용자가 실제로 볼 수 있는 경로가 있는지, 그리고 그 경로가 자동 검증에 포함되어 있는지까지 확인해야 한다.

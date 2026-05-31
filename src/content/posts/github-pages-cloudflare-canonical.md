---
title: "GitHub Pages 루트 URL을 끄고 Cloudflare Pages를 canonical로 정리한 기록"
description: "ytkim4558.github.io를 더 이상 실제 사이트로 쓰지 않기 위해 GitHub Pages를 끄고, Astro 설정과 sitemap을 Cloudflare Pages 기준으로 바꾼 배포 정리 기록이다."
pubDate: 2026-06-01
tags:
  - AI Workflow
  - Portfolio
lang: ko
---

`ytkim4558.github.io`는 한동안 실제 사이트처럼 보였지만, 현재 사이트의 canonical 배포 대상은 Cloudflare Pages다. 그래서 이전 GitHub Pages 루트 URL을 계속 살려 두면 다음 문제가 생긴다.

- 사용자가 어느 URL이 최신인지 헷갈린다.
- AI 에이전트가 GitHub Pages repo를 실제 배포 repo로 착각할 수 있다.
- `robots.txt`, `sitemap.xml`, canonical URL이 서로 다른 도메인을 가리킬 수 있다.

이번 작업의 목적은 사이트를 지우는 것이 아니라 **공식 기준 URL을 하나로 고정하는 것**이었다.

## Trigger

사용자가 `https://ytkim4558.github.io/`는 이제 날리자고 했다. 이미 사이트는 `https://ytkim4558.pages.dev/`에서 정상 운영되고 있었고, GitHub Pages 쪽은 더 이상 주 배포 경로가 아니었다.

처음 확인한 상태는 다음과 같았다.

- `ytkim-astro-site`: Astro source repo
- `ytkim4558.github.io`: 과거 GitHub Pages 정적 산출물 repo
- Cloudflare Pages live URL: `https://ytkim4558.pages.dev/`
- GitHub Pages API: user site 설정이 남아 있음

## 시도와 실수

먼저 GitHub Pages API로 Pages를 끄려고 했다.

```powershell
gh api -X DELETE repos/ytkim4558/ytkim4558.github.io/pages
```

하지만 username Pages repository는 이 방식으로 비활성화할 수 없었다.

```text
Deactivating GitHub pages for this repository is not allowed.
```

그래서 repo 이름을 바꾸면 user site URL이 끊긴다는 판단으로 repo를 archive 이름으로 변경했다. 이 판단 자체는 GitHub Pages URL을 끊는 데는 효과가 있었지만, 중간에 repo를 `archived=true`로 잠그면서 문제가 생겼다.

`ytkim-astro-site` 로컬 repo의 origin도 같은 GitHub repo를 가리키고 있었기 때문에, source repo까지 read-only가 되어 push가 막혔다.

```text
ERROR: This repository was archived so it is read-only.
```

이건 좋은 자동화가 아니라 **source repo와 public URL repo의 역할을 분리하지 못한 작업 실수**였다.

## Fix

복구는 삭제가 아니라 이름과 역할을 재정리하는 방식으로 진행했다.

1. GitHub repo를 `ytkim-astro-site`로 rename했다.
2. `archived=false`로 되돌렸다.
3. GitHub Pages는 비활성 상태로 유지했다.
4. repo homepage를 `https://ytkim4558.pages.dev/`로 바꿨다.
5. 로컬 `ytkim-astro-site` remote를 새 SSH alias URL로 수정했다.

```powershell
git remote set-url origin git@github.com-ytkim:ytkim4558/ytkim-astro-site.git
```

Astro 설정도 Cloudflare Pages 기준으로 바꿨다.

- `astro.config.mjs`: `site`를 `https://ytkim4558.pages.dev`로 변경
- `public/robots.txt`: sitemap URL을 `pages.dev`로 변경
- `public/sitemap.xml`: 모든 URL을 `pages.dev`로 변경
- `README.md`: GitHub Pages가 아니라 Cloudflare Pages가 canonical임을 명시

## Verification

로컬에서는 다음을 통과했다.

```powershell
npm.cmd run build
npm.cmd run validate
```

검증 결과:

- locale validation 통과
- internal link validation 통과
- content reachability validation 통과
- Playwright UI validation 통과
- 공개 repo 금지 문자열 스캔 통과

GitHub/라이브 상태도 확인했다.

- `https://ytkim4558.github.io/`: GitHub Pages 404
- `https://ytkim4558.pages.dev/`: 200
- GitHub repo: `ytkim4558/ytkim-astro-site`
- GitHub Pages: `has_pages=false`
- GitHub repo homepage: `https://ytkim4558.pages.dev/`
- Cloudflare Pages deploy workflow: 성공

## Rule For Next Time

GitHub Pages URL을 끊을 때는 repo 삭제나 archive부터 하지 않는다.

다음 순서로 처리한다.

1. canonical live URL을 먼저 정한다.
2. source repo와 legacy URL repo가 같은 GitHub repo인지 확인한다.
3. `gh api repos/<owner>/<repo> --jq "{name, archived, has_pages, homepage}"`로 상태를 확인한다.
4. `archived=true`는 push를 막으므로 source repo에는 쓰지 않는다.
5. `astro.config.mjs`, `robots.txt`, `sitemap.xml`, README를 canonical URL 기준으로 맞춘다.
6. build/validate/GitHub Actions/live URL을 모두 확인한다.

## 다른 AI 에이전트에게 남기는 메모

현재 실제 source repo는 `C:\Users\ytkim\projects\ytkim-astro-site`이고, remote는 다음과 같다.

```text
git@github.com-ytkim:ytkim4558/ytkim-astro-site.git
```

공식 live URL은 `https://ytkim4558.pages.dev/`다. `ytkim4558.github.io`는 실제 source나 canonical site가 아니다.


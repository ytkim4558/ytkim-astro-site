---
title: "모달과 모바일 가독성 문제를 브라우저 검증으로 바꾼 기록"
description: "포트폴리오 마이그레이션 후 스크린샷 갤러리와 사이드 프로젝트 모달이 실제로 보기 어려운 문제를 Playwright 기반 UI 검증으로 바꾼 기록이다."
pubDate: 2026-05-31
tags:
  - AI Workflow
  - Portfolio
lang: ko
---

포트폴리오를 Astro로 옮긴 뒤 링크 검증과 콘텐츠 도달성 검증은 통과했다. 하지만 사용자가 실제 페이지를 열어보니 문제가 남아 있었다.

HotDealppom 같은 사이드 프로젝트는 콘텐츠가 HTML 안에 있었지만 카드에서 바로 알아보기 어렵고, 모달 안의 여러 스크린샷은 좁은 폭에서 뭉쳐 보였다. 모바일에서는 더 심했다.

## Trigger

사용자가 "매번 이렇게 지적하는 거 하지 말고 검증 스크립트를 만들라"고 지적했다.

이전 검증은 한 단계 부족했다. 콘텐츠가 존재하고 링크가 404가 아니어도, 실제 사용자가 클릭해서 읽을 수 있는지는 확인하지 못했다.

## Context

기존 검증은 다음을 봤다.

- locale route가 생성되는지
- 내부 링크가 깨지지 않는지
- 포트폴리오 주요 콘텐츠 id가 HTML 안에 있고 모달 target으로 연결되는지

하지만 이 기준은 브라우저 렌더링을 보지 않았다. 그래서 깨진 Markdown 이미지, 모바일 가로 넘침, 모달 안 이미지 밀집, 실제 클릭 후 내용 부족 같은 문제를 놓칠 수 있었다.

## Rejected Option

처음에는 특정 카드나 특정 CSS만 고치는 방식으로 접근할 수 있었다. 하지만 이 방식은 사용자가 말한 문제를 또 반복하게 만든다.

이번 기준은 특정 증상이 아니라 다음 질문으로 바꿨다.

```text
빌드된 모든 주요 페이지를 데스크톱과 모바일 브라우저에서 열었을 때, 사람이 쉽게 읽고 클릭해서 확인할 수 있는가?
```

## Fix

`scripts/validate-ui.mjs`를 추가했다. 이 스크립트는 Playwright Chromium으로 빌드된 `dist`를 로컬 서버에 띄우고 데스크톱과 모바일 viewport에서 검사한다.

검증 범위는 다음과 같다.

- 모든 빌드된 주요 HTML 페이지를 열어 본문 길이, heading 구조, 깨진 이미지, 가로 overflow를 확인
- `/portfolio/`, `/en/portfolio/`, `/ja/portfolio/`에서 실제 카드 클릭으로 모달을 열기
- `#side-projects`, `#detail-hotdealppom`, `#detail-bikenavi` 모달의 텍스트 길이, 핵심 marker, 이미지 수, iframe 수 확인
- 모바일 모달 갤러리 아이템이 너무 좁게 뭉치지 않는지 확인

이 검증을 `npm run validate`에 포함했다.

```json
{
  "validate:ui": "node scripts/validate-ui.mjs",
  "validate": "npm run validate:locales && npm run validate:links && npm run validate:content && npm run validate:ui"
}
```

GitHub Actions도 `npx playwright install --with-deps chromium`을 실행하도록 바꿔 CI에서 같은 브라우저 검증을 수행한다.

## What The New Check Caught

새 검증은 바로 실패했다.

- `/android/` 글의 Jekyll식 이미지 문법이 Astro에서 깨진 이미지로 렌더링되고 있었다.
- 일본어 HotDealppom 모달의 상세 텍스트가 너무 짧았다.
- 모바일 일본어 포트폴리오 모달에서 긴 링크/텍스트가 가로 overflow를 만들었다.

이 실패를 기준으로 수정했다.

- Android 글의 이미지 경로를 Astro Markdown 문법으로 변경
- 일본어 HotDealppom 상세 설명 보강
- 모달 콘텐츠에 `overflow-wrap: anywhere` 적용
- 포트폴리오 갤러리를 `object-fit: contain` 중심으로 바꾸고, 모바일 모달에서는 1열로 읽히게 조정
- `Mobile Experiments`라는 모호한 카드명을 `HotDealppom`으로 바꾸고 `BikeNavi` 카드를 별도로 추가

## Verification

최종 검증은 다음과 같이 통과했다.

```powershell
npm.cmd run build
npm.cmd run validate
```

결과:

```text
Locale validation passed
Internal link validation passed
Content reachability validation passed for posts and localized portfolio content.
UI validation passed for 70 pages across desktop/mobile and portfolio modal content.
```

## Rule For Next Time

UI 마이그레이션에서 "콘텐츠가 있다"와 "사용자가 쉽게 볼 수 있다"는 다르다.

다음부터는 다음 기준을 기본으로 둔다.

1. 링크·locale·콘텐츠 id 검증만으로 끝내지 않는다.
2. 포트폴리오, 모달, 갤러리, 모바일 레이아웃은 실제 브라우저 클릭 검증을 포함한다.
3. 사용자가 보기 어렵다고 말한 문제는 특정 페이지 패치가 아니라 재발 방지 검증으로 바꾼다.
4. 새 검증이 처음 실패한 항목은 블로그/인수인계 문서에 남겨 다음 AI가 같은 기준으로 시작하게 한다.

## 다른 AI 에이전트에게 남기는 메모

이 repo에서 포트폴리오나 레이아웃을 고칠 때는 `npm run validate`가 이제 브라우저 검증까지 포함한다.

단순히 HTML에 marker가 있는지 보지 말고, `scripts/validate-ui.mjs`가 실제 클릭으로 모달을 열어 보는 기준을 같이 확인해야 한다.

새로운 모달 카드나 스크린샷 갤러리를 추가하면 다음을 함께 업데이트한다.

- `scripts/validate-content-reachability.mjs`
- `scripts/validate-ui.mjs`
- 관련 KO/EN/JA 포트폴리오 페이지
- 필요하면 이와 같은 AI Workflow 기록

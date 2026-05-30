---
title: "오래된 Jekyll 블로그의 Dependabot 취약점 33개를 정리한 기록"
description: "처음에는 단순한 경고처럼 보였지만, 실제로 확인해 보니 오래된 Jekyll 블로그 의존성에서 열린 취약점 알림이 여러 개 쌓여 있었다."
pubDate: 2026-05-17
tags:
  - AI Workflow
lang: ko
---

<a href="https://github.com/ytkim4558/codex-resume"><code>codex-resume</code></a> 작업을 포트폴리오와 블로그에 반영하는 과정에서 GitHub push 메시지에 Dependabot 경고가 같이 떴다.
처음에는 단순한 경고처럼 보였지만, 실제로 확인해 보니 오래된 Jekyll 블로그 의존성에서 열린 취약점 알림이 여러 개 쌓여 있었다.

이 글은 그 취약점을 무작정 최신화하지 않고, 사이트가 계속 빌드되는지 검증하면서 정리한 기록이다.

## 문제를 발견한 위치

블로그는 두 개의 저장소로 나뉘어 있었다.

- `GitHubPageMaker`: Jekyll 소스 저장소
- `ytkim4558.github.io`: 실제 GitHub Pages에 올라가는 생성 결과물 저장소

처음에는 `ytkim4558.github.io`만 보면 되는 줄 알았지만, 실제 수정해야 할 곳은 Jekyll 소스가 있는 `GitHubPageMaker`였다.
생성된 HTML만 직접 고치면 다음 빌드 때 다시 덮어써질 수 있기 때문이다.

그래서 작업 기준을 다음처럼 정했다.

- 소스 변경은 `GitHubPageMaker`에서 한다.
- Jekyll로 `output/`을 생성한다.
- 생성 결과를 `ytkim4558.github.io`에 반영한다.
- 공개 URL에서 실제 반영 여부를 확인한다.

## 첫 번째 원인: jekyll-tasks

Dependabot 알림 중 가장 먼저 정리한 것은 npm 패키지 `jekyll-tasks`였다.
이 패키지는 특정 버전만 취약한 것이 아니라 패키지 자체가 malware로 표시되어 있었다.

다행히 현재 블로그 빌드에는 이 패키지가 필요하지 않았다.

- `package.json`에는 들어 있었다.
- 하지만 실제 Jekyll 빌드는 npm이 아니라 `bundle exec jekyll build`로 수행했다.
- `gulpfile.js`에서도 `require('jekyll-tasks')`로 사용하지 않았다.

그래서 이 패키지는 제거했다.

```json
"dependencies": {
  "gulp": "github:gulpjs/gulp"
}
```

제거 후 바로 배포하지 않고, Jekyll 빌드가 그대로 성공하는지 먼저 확인했다.

## 두 번째 원인: 오래된 GitHub Pages 런타임

Ruby 쪽 알림은 대부분 오래된 `github-pages` gem에서 시작됐다.
기존 설정은 다음과 같았다.

```ruby
gem "jekyll", "~> 3.6.2"
gem "github-pages", "~> 168"
gem "rake", "~> 12.3.0"
```

이 조합은 `nokogiri`, `addressable`, `activesupport`, `tzinfo`, `faraday` 같은 오래된 하위 의존성을 끌고 왔다.
Dependabot 알림도 대부분 이 하위 의존성에서 발생했다.

처음에는 `github-pages`만 최신 계열로 올려도 충분할 것이라고 봤다.

```ruby
gem "github-pages", "~> 232"
```

하지만 이 상태에서는 `nokogiri 1.18.10`이 설치되어, 최신 `nokogiri < 1.19.3` 알림이 남을 수 있었다.
그래서 GitHub Pages 제약 범위 안에서 `nokogiri`를 명시적으로 올렸다.

```ruby
gem "github-pages", "~> 232"
gem "nokogiri", ">= 1.19.3"
```

## 왜 Docker로 검증했나

Windows 로컬 환경에는 Ruby, Bundler, Jekyll이 설치되어 있지 않았다.
새로 Ruby를 설치하는 대신 Docker로 빌드 환경을 고정했다.

초기에는 `jekyll/jekyll:3.8` 이미지를 사용했지만, 최신 `nokogiri 1.19.3`은 Ruby 3.2 이상이 필요했다.
그래서 최종 검증은 Ruby 3.2 컨테이너에서 진행했다.

```powershell
docker run --rm `
  -v jekyll_bundle_232_ruby32_bundler269:/usr/local/bundle `
  -v "C:\Users\ytkim\projects\GitHubPageMaker:/srv/jekyll" `
  -w /srv/jekyll `
  ruby:3.2 `
  bash -lc "gem install bundler -v 2.6.9 && bundle _2.6.9_ update github-pages nokogiri && bundle _2.6.9_ exec jekyll build --future"
```

여기서 `--future`를 붙인 이유는 같은 날 작성한 글이 컨테이너 시간대 기준으로 future post로 판단되어 빌드에서 빠질 수 있었기 때문이다.

## 확인한 것

업데이트 후에는 다음을 확인했다.

- Jekyll 빌드 성공
- 포트폴리오 페이지 정상 생성
- `codex-resume` 글 정상 생성
- `AI Workflow` 태그 페이지 정상 생성
- 기존 상단 메뉴가 새 메뉴로 유지됨
- GitHub Dependabot API 기준 open alert 0개
- 공개 URL 응답 200 OK

최종적으로 확인한 핵심 URL은 다음과 같다.

- `https://ytkim4558.github.io/portfolio/`
- `https://ytkim4558.github.io/codex-resume-tui-decision`
- `https://ytkim4558.github.io/tag/ai-workflow/`

## 정리

이번 작업의 핵심은 단순히 `bundle update`를 실행한 것이 아니었다.
오래된 블로그는 의존성만 올리면 깨질 수 있기 때문에, 다음 순서가 중요했다.

1. 실제로 쓰지 않는 malware 패키지부터 제거
2. Jekyll 소스 저장소와 생성 결과물 저장소를 분리해서 확인
3. Docker로 빌드 환경 고정
4. GitHub Pages 런타임 업데이트
5. 취약 하위 의존성인 `nokogiri`를 패치 버전으로 고정
6. 생성 결과를 공개 페이지에서 검증

결과적으로 오래된 Jekyll 블로그를 유지하면서도, GitHub Dependabot 경고를 0개로 줄일 수 있었다.

이런 작업은 눈에 띄는 기능 개발은 아니지만, 운영 중인 개인 사이트를 계속 신뢰 가능한 상태로 유지하는 데 필요한 기본 작업이다.

## 다른 AI 에이전트에게 남기는 메모

이 블로그를 다음에 수정하는 AI 에이전트는 `ytkim4558.github.io`의 HTML을 바로 고치는 대신, 먼저 `GitHubPageMaker` 소스를 수정해야 한다.

- 소스 repo: `C:\Users\ytkim\projects\GitHubPageMaker`
- 배포 repo: `C:\Users\ytkim\projects\ytkim4558.github.io`
- 빌드는 Ruby 3.2 Docker 컨테이너와 Bundler 2.6.9 기준으로 한다.
- 같은 날 작성한 글이 빠지지 않도록 `jekyll build --future`를 사용한다.
- `jekyll-tasks`는 malware 알림 원인이므로 다시 추가하지 않는다.
- `github-pages ~> 232`, `nokogiri >= 1.19.3` 제약을 유지한다.

자세한 절차는 저장소 루트의 `AGENTS.md`에 남겨두는 것이 좋다.


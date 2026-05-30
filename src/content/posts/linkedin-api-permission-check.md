---
title: "LinkedIn API로 기존 글을 읽어 톤을 맞추려다 확인한 것"
description: "LinkedIn에 새 글을 올리기 전에 기존에 내가 썼던 글의 톤을 보고 맞추고 싶었다."
pubDate: 2026-05-18
tags:
  - AI Workflow
lang: ko
---

LinkedIn에 새 글을 올리기 전에 기존에 내가 썼던 글의 톤을 보고 맞추고 싶었다.
처음에는 GitHub API처럼 OAuth만 연결하면 내 게시글도 바로 읽을 수 있을 것이라고 생각했다.

하지만 직접 LinkedIn Developer 앱을 만들고 OAuth를 붙여보니, 결론은 조금 달랐다.

## 목표

목표는 단순했다.

- LinkedIn Developer 앱 생성
- OAuth로 본인 계정 인증
- 기존 게시글 조회
- 기존 글의 문장 길이, 말투, 한영 병기 방식, 해시태그 사용 방식을 분석
- 새 LinkedIn 포스트 초안을 그 톤에 맞게 작성

이미 [`linkedin-posting-mcp`](https://github.com/ytkim4558/linkedin-posting-mcp)라는 로컬 MCP 서버를 만들어둔 상태였기 때문에,
여기에 게시글 조회 도구를 추가해 실제로 가능한지 확인했다.

## 구현한 것

`linkedin-posting-mcp`에 다음 기능을 추가했다.

- `linkedin_get_my_posts` MCP tool
- `auth:url:signin`: `openid profile email`만 요청하는 최소 로그인 테스트
- `auth:url`: `openid profile email w_member_social` 요청
- `auth:url:read`: `r_member_social`까지 포함해 기존 게시글 조회 가능성 테스트
- `posts:me`: 인증된 사용자의 최근 게시글 조회 테스트

조회 요청은 LinkedIn Posts API의 author finder 형태로 구성했다.

```text
GET /rest/posts?author=urn:li:person:{member_id}&q=author
```

## 실제로 확인한 흐름

먼저 LinkedIn Developer 앱을 만들었다.
앱 생성에는 연결할 LinkedIn Page가 필요했고, 개인 기술 노트용으로 `Yongtak Engineering Notes` 페이지를 만들었다.

이 과정에서 생각보다 많은 작은 판단이 필요했다.

## 중간에 헷갈렸던 지점들

첫 번째는 **LinkedIn Page 종류**였다.

처음에는 앱 생성 화면에서 `Create a new LinkedIn Page`를 눌렀고, `linkedin.com/showcase/` 형태의 페이지 생성 화면으로 들어갔다.
하지만 Showcase page는 기존 회사 페이지의 하위 페이지라서 `연결된 단체 페이지`가 필수였다.
개인 개발자 앱 연결용으로는 맞지 않았다.

결국 `LinkedIn 페이지 만들기` 화면에서 `회사` 유형을 골라 일반 Company Page를 만들었다.
판단 기준은 단순했다.

- `linkedin.com/showcase/`가 보이면 하위 브랜드/쇼케이스 페이지라서 이번 목적과 맞지 않다.
- `linkedin.com/company/`가 보이면 Developer App에 연결할 일반 페이지로 쓸 수 있다.

두 번째는 **앱 이름**이었다.

처음 생각한 이름은 `Yongtak LinkedIn Workflow`였지만, LinkedIn Developer 앱 이름에는 `LinkedIn`이라는 단어를 넣을 수 없었다.
그래서 앱 이름은 `Yongtak AI Workflow`처럼 바꿔야 했다.

세 번째는 **회사 페이지 약관 체크**였다.

화면에는 "회사 페이지의 공식 담당자로서 회사를 대표해서 회사 페이지를 관리할 권리가 있음을 확인한다"는 문구가 나온다.
실제 회사나 이전 회사 이름으로 만들면 애매하지만, `Yongtak Engineering Notes`처럼 본인이 직접 만든 개인 기술 노트 페이지라면 본인이 관리 주체이므로 진행할 수 있다고 판단했다.

네 번째는 **앱 로고 조건**이었다.

LinkedIn Developer 앱은 유효한 app logo를 요구했다.
기존 이미지가 조건에 안 맞을 수 있어서 300x300 PNG를 별도로 만들었다.
이런 로고는 기능에는 중요하지 않지만, OAuth 동의 화면에 노출되므로 최소한 구분 가능한 형태가 필요했다.

다섯 번째는 **PowerShell 환경변수 입력**이었다.

처음에는 `SetEnvironmentVariable`에 값을 직접 넣으려다 쉼표 누락과 특수문자 때문에 문법 오류가 났다.
그래서 테스트 단계에서는 사용자 환경변수에 저장하지 않고, 현재 PowerShell 세션에만 넣는 방식으로 바꿨다.

```powershell
$env:LINKEDIN_CLIENT_ID = Read-Host "LinkedIn Client ID"
$env:LINKEDIN_CLIENT_SECRET = Read-Host "LinkedIn Client Secret"
$env:LINKEDIN_REDIRECT_URI = "http://localhost:3000/callback"
```

이 방식은 창을 닫으면 사라지므로 테스트에 적합하고, `Client Secret`을 평문 사용자 환경변수에 남기지 않아도 된다.

여섯 번째는 **authorization code 복사 방식**이었다.

callback URL 전체를 넣거나 `code=`까지 같이 넣으면 token exchange가 실패한다.
실행해야 하는 값은 오직 `code` 값 자체다.

```text
http://localhost:3000/callback?code=AQ...&state=...
```

위 URL이라면 실행은 이렇게 해야 한다.

```powershell
npm run auth:exchange -- "AQ..."
```

`code=`나 `&state=...`는 넣지 않는다.

일곱 번째는 **Client Secret 노출 대응**이었다.

테스트 중 secret이 채팅에 노출될 수 있다는 점도 확인했다.
이 경우 LinkedIn Developer 앱의 `Generate a new Client Secret`으로 새 secret을 만들고, 기존 노출 값을 폐기해야 한다.

## 오류 메시지별 대응

이번 작업에서 실제로 마주친 오류와 대응은 다음과 같다.

| 오류/증상 | 발생한 이유 | 대응 |
|---|---|---|
| `Missing LinkedIn config: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET` | 현재 PowerShell 세션에 LinkedIn 앱 설정이 없다. `$env:`로 넣은 값은 새 창에서 유지되지 않는다. | 같은 PowerShell 창에서 `Read-Host`로 다시 입력하거나, User 환경변수로 저장한 뒤 새 창을 연다. |
| `Missing ')' in method call` / `Unexpected token 'User'` | PowerShell `SetEnvironmentVariable()` 호출에서 쉼표가 빠졌거나 따옴표가 깨졌다. | 테스트 단계에서는 `SetEnvironmentVariable` 대신 `$env:LINKEDIN_CLIENT_ID = Read-Host ...` 방식을 쓴다. |
| `Bummer, something went wrong. In five seconds, you will be redirected to: localhost` | LinkedIn이 `localhost` callback으로 redirect하려는데 받을 로컬 서버가 없어서 브라우저가 실패처럼 보인다. | `node -e "http=require('http');http.createServer((q,s)=>{console.log(q.url);s.end('OK')}).listen(3000)"`로 임시 callback 서버를 띄운다. |
| `SyntaxError: Invalid or unexpected token` | `node -e` 명령을 PowerShell에 여러 줄로 붙여넣어 JavaScript 문자열이 중간에서 끊겼다. | 짧은 한 줄 명령으로 실행한다. PowerShell 프롬프트가 `>>`로 바뀌면 줄이 깨진 것이다. |
| `Unable to retrieve access token: authorization code not found` | `code` 값을 잘못 복사했거나, 이미 사용한 authorization code를 다시 썼거나, 시간이 지나 만료됐다. | OAuth URL을 다시 생성하고 새 code를 즉시 교환한다. `code=`와 `&state=`는 빼고 값만 넣는다. |
| `ACCESS_DENIED: Not enough permissions to access: partnerApiPostsExternal.FINDER-author` | OAuth 로그인과 토큰 발급은 성공했지만, 앱에 Posts Finder API 조회 권한이 없다. | `r_member_social`을 포함해 다시 인증해본다. 그래도 같으면 LinkedIn 앱 권한/심사 영역이라 수동 샘플 기반으로 톤 분석한다. |
| `Please upload a valid app logo` | 앱 로고 파일이 LinkedIn 조건에 맞지 않거나 미리보기 가능한 이미지가 아니다. | 300x300 PNG/JPG를 새로 만들어 업로드한다. |
| 앱 이름에 `LinkedIn`을 넣을 수 없음 | LinkedIn Developer 앱 이름에 `LinkedIn` 브랜드 단어 사용이 제한된다. | `Yongtak AI Workflow`, `Yongtak Workflow Tools`처럼 바꾼다. |
| `연결된 단체 페이지`가 필수로 나옴 | Showcase page 생성 화면에 들어간 경우다. Showcase는 기존 회사 페이지의 하위 페이지다. | 뒤로 가서 `회사` 유형의 일반 Company Page를 만든다. URL이 `linkedin.com/company/...`인지 확인한다. |

이 표를 남기는 이유는 간단하다.
OAuth 문제는 대부분 "권한이 없다"로 뭉뚱그려 보이지만, 실제로는 설정 누락, redirect 서버 부재, code 복사 실수, API 권한 부족이 전부 다른 문제다.
각 단계의 오류를 분리해서 봐야 시간을 덜 버린다.

이후 OAuth redirect URL을 아래처럼 등록했다.

```text
http://localhost:3000/callback
```

초기에는 callback을 받을 로컬 서버가 없어서 브라우저에 `Bummer, something went wrong.` 메시지가 보였다.
하지만 이것은 OAuth가 완전히 실패했다기보다, LinkedIn이 `localhost`로 redirect하려는데 받을 서버가 없어서 생긴 혼란이었다.

간단한 Node HTTP 서버를 띄우고 다시 시도하니 callback code를 받을 수 있었다.

```powershell
node -e "http=require('http');http.createServer((q,s)=>{console.log(q.url);s.end('OK')}).listen(3000)"
```

그 다음 authorization code를 access token으로 교환하는 것까지는 성공했다.

## 막힌 지점

문제는 기존 게시글 조회였다.

`posts:me`를 실행하면 다음 에러가 반환됐다.

```text
LinkedIn API 403:
ACCESS_DENIED
Not enough permissions to access: partnerApiPostsExternal.FINDER-author
```

즉 OAuth 인증 자체는 성공했지만, 이 앱이 Posts Finder API로 본인 게시글을 읽을 권한은 없었다.
`r_member_social`을 scope에 포함해 다시 인증해도 결과는 같았다.

이후 공식 FAQ를 다시 확인하니 결론은 더 명확했다.
LinkedIn Marketing API FAQ는 `r_member_social`을 closed permission으로 설명하고, 현재 resource constraint 때문에 access request를 받지 않는다고 안내한다.

즉 이 문제는 구현 문법이나 OAuth callback 처리가 아니라, 현재 앱에 발급 가능한 권한의 경계였다.

- `Sign In with LinkedIn using OpenID Connect`: 로그인과 기본 프로필 확인
- `Share on LinkedIn`: `w_member_social`, 글 작성 권한
- `Community Management API / Posts API`: 게시글 조회와 관리 영역
- `r_member_social`: 개인 게시글 조회에 필요한 권한이지만 closed/restricted

## 결론

LinkedIn API는 존재하지만, 개인 개발자 앱에서 기존 게시글 조회가 GitHub처럼 바로 열리는 구조는 아니었다.

이번 확인으로 나눈 결론은 다음과 같다.

- 로그인/OIDC 인증은 가능하다.
- 토큰 발급도 가능하다.
- 향후 승인된 범위 안에서 게시 워크플로를 만드는 것은 가능하다.
- 하지만 기존 게시글 조회는 별도 권한 승인 없이 바로 되지 않았다.
- 공식 FAQ 기준으로 `r_member_social`은 closed permission이므로, 개인 개발자 앱에서 기존 개인 글을 바로 읽는 경로로 기대하면 안 된다.
- 따라서 "기존 LinkedIn 글을 읽어 톤을 분석"하는 작업은 당장은 수동 샘플 기반이 현실적이다.

## 앞으로의 규칙

LinkedIn 자동화는 다음 기준으로 다룬다.

- 브라우저 쿠키, 내부 API, 스크래핑, DM 자동화는 사용하지 않는다.
- 공식 OAuth와 문서화된 API만 사용한다.
- 기존 글 조회가 필요하면 `r_member_social` 또는 Posts Finder 권한이 실제로 승인됐는지 먼저 확인한다.
- 권한이 없으면 사용자가 기존 글 2~3개를 직접 제공하고, 그 샘플을 기반으로 톤을 맞춘다.
- Client Secret, authorization code, access token은 채팅과 저장소에 남기지 않는다.

이번 삽질의 핵심은 이것이었다.

API가 있다는 것과, 내가 원하는 작업을 지금 내 앱 권한으로 할 수 있다는 것은 다르다.


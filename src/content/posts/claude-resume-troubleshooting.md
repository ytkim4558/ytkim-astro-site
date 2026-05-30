---
title: "claude-resume TUI를 만들며 마주친 우여곡절 — 인코딩, 키 충돌, 재귀 호출, 스크린샷 모자이크"
description: "claude-resume는 Claude Code의 기본 claude --resume 화면을 대체하기 위해 직접 만든 TUI 도구다."
pubDate: 2026-05-17
tags:
  - AI Workflow
lang: ko
---

[`claude-resume`](https://github.com/ytkim4558/claude-resume)는 Claude Code의 기본 `claude --resume` 화면을 대체하기 위해 직접 만든 TUI 도구다.
기본 화면은 세션 ID와 시각만 보여주는데, 세션이 쌓이면 "이 ID가 어떤 작업이었지" 가 한눈에 안 들어온다.
첫 메시지 한 줄 미리보기조차 없어서 매번 ID를 일일이 클릭해 확인해야 했다.

해결은 단순했다. **좌측에는 세션 리스트 + 백그라운드 LLM 요약, 우측에는 선택한 세션의 전체 대화** — 두 패널 TUI.

![claude-resume의 두 패널 TUI와 LLM 요약 화면](/assets/images/claude-resume/claude-resume-redacted.png)

말로는 간단하지만 만드는 동안 마주친 결정과 실수가 적지 않았다. 이 글은 그 우여곡절의 기록이다.

## 핵심 결정 4가지

### 1. 요약은 별도 API 키가 아니라 `claude -p` subprocess로

처음엔 Anthropic API 직접 호출(별도 API 키 + 종량제)을 검토했지만 다음 이유로 기각했다.

- 별도 결제 발생 (Claude Code Pro 구독비는 API 호출에 안 쓰임)
- API 키 보안 관리 부담 (`keyring` 등 추가 셋업 필요)
- 호출 빈도가 낮아서 `claude -p` 의 6초 지연을 백그라운드 스레드로 흡수 가능

결과적으로 **Pro 구독만으로 동작**, 사용자가 추가 설정할 게 없다.

### 2. 정렬용 timestamp는 파일 mtime이 아니라 JSONL 내부 시각

세션 정렬·표시용 "마지막 활동" 시각은 JSONL 파일의 mtime이 아니라 **파일 안의 마지막 user/assistant 메시지의 timestamp 필드**를 쓴다.

이유는 사용자 요청이 명확했다 — "LLM 돌렷다고 그 날짜 갱신시키지 말고". 캐시 파일이나 다른 도구가 파일을 건드려도 정렬 순서가 흔들리지 않아야 한다.

### 3. 재귀 호출 방어 — 프롬프트 마커

`claude -p "요약해줘 ..."` 호출이 그 자체로 **새 Claude Code 세션을 만든다**.
즉 다음번 피커 실행 시 그 요약 호출 세션이 또 피커에 뜨고, 그걸 또 요약하려 하고... 무한 증식.

해결: 요약 프롬프트 첫 줄에 `<<CLAUDE-RESUME-SUMMARY-V1>>` 마커를 박고, 세션의 첫 user 메시지에 이 마커가 있으면 리스트에서 제외했다.
레거시(마커 없던 시절) 세션도 프롬프트 접두사 매칭으로 함께 필터했다.

### 4. CMD / PowerShell 양쪽에서 동일 명령어로 호출

처음엔 PowerShell `$PROFILE` 함수만 등록했는데 사용자가 곧장 CMD 에서 띄워보고 안 잡힌다고 알려줬다.
결국 세 가지 entrypoint를 함께 둬야 했다.

- `claude-resume.py` — 실제 TUI (Textual)
- `claude-resume.ps1` — PowerShell 래퍼 (인코딩 강제, 환경변수, 핸드오프)
- `claude-resume.cmd` — CMD 호환 shim (`.ps1`을 `-NoProfile -ExecutionPolicy Bypass`로 호출)

`~/.claude/scripts/`를 PATH에 추가하면 어느 셸에서든 `claude-resume`이 동작한다.

## 우여곡절 — 실제로 깨졌던 것들

### 한글 인코딩 (PowerShell ↔ subprocess)

증상: `claude -p`에 한글 프롬프트 전달 시 `???`로 깨짐.

원인: PowerShell의 기본 stdin/stdout 인코딩이 UTF-16 LE 또는 OEM 코드페이지.
파이프 한 번 거치면 마커 같은 ASCII는 살아남아도 한글은 다 죽었다.

해결: PowerShell 래퍼에서 환경변수와 콘솔 인코딩을 명시.

```powershell
$env:PYTHONIOENCODING = 'utf-8'
$env:PYTHONUTF8       = '1'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()
```

Python 쪽에서는 `subprocess.run([...], capture_output=True)` 한 뒤 직접 `.decode("utf-8", errors="replace")` 로 디코딩.

### Textual ListView의 Enter 키가 안 먹음

증상: 화살표로 항목 이동은 되는데 Enter를 눌러도 무반응.

원인: 앱 레벨에 `Binding("enter", "resume", ...)`를 걸어뒀더니 ListView 내장 Enter 핸들러(`ListView.Selected` 이벤트)를 가로채서 둘 다 무력화됐다.

해결: 앱 레벨 Enter 바인딩을 제거하고 `on_list_view_selected` 이벤트 핸들러로 처리했다.
백업으로 `s` 키도 같은 동작에 묶고, `on_mount`에서 `lv.focus()`를 명시해 시작 직후부터 화살표가 잡히도록 했다.

### Windows CMD에서 한글이 다른 폰트로 보임

증상: TUI를 띄우면 한글이 영문 폰트와 다른 폰트로 보여서 어색했다.

원인: 터미널 기본 모노스페이스 폰트(Cascadia Mono 등)에 한글 글리프가 없어서 Windows가 맑은 고딕 같은 폰트로 자동 fallback.
래퍼에서 `chcp 65001`로 코드페이지를 UTF-8로 바꿔도 폰트 fallback은 별개 문제였다.

해결책 (사용자 안내): Windows Terminal + D2Coding / Sarasa Mono K 같은 CJK 통합 코딩 폰트로 변경.
이건 도구가 풀 수 있는 문제가 아니라서 README에 권장 폰트를 명시했다.

### 세션 핸드오프 — TUI가 stdout을 점유

Textual은 화면 렌더링에 stdout을 점유한다.
즉 사용자가 세션을 고르면 stdout으로 ID를 print해서 부모 셸이 받아 `claude --resume <id>`를 실행하는 패턴이 안 통한다.

해결: 선택된 ID를 `~/.claude/.resume-target` 임시 파일에 쓰고 TUI 종료, PowerShell 래퍼가 그 파일을 읽어 `claude --resume <id>`를 실행하는 식으로 우회.

### 데모 스크린샷 모자이크 — 좌표 계속 어긋남

블로그/포트폴리오에 쓸 데모 이미지에 다른 세션 미리보기가 그대로 노출돼 있어서 좌측 패널 일부를 가려야 했다.
PIL로 Gaussian blur + 반투명 overlay를 얹는 식으로 처리했는데, 처음엔 좌표가 자꾸 어긋났다.

문제: 미리 보기 렌더링이 다운스케일된 이미지라 내가 보는 박스 위치와 실제 픽셀 좌표가 달랐다.
**원본 픽셀 기준으로 좌표를 다시 계산하고, 단순 blur 위에 솔리드 overlay까지 얹어** 잔상 텍스트가 새어 나오지 않도록 강화했다.

```python
crop = img.crop((x1, y1, x2, y2))
img.paste(crop.filter(ImageFilter.GaussianBlur(radius=20)), (x1, y1))
overlay = Image.new('RGBA', (x2 - x1, y2 - y1), (50, 50, 60, 215))
img.paste(overlay, (x1, y1), overlay)
```

공개용 이미지에는 항상 검증 단계가 한 번 더 필요하다는 걸 다시 확인했다.

## 결론 — 세션 picker가 아니라 작업 기억 브라우저

만들고 보니 `claude-resume`의 핵심은 ID나 시각이 아니라 **"무슨 작업이었지?"를 빠르게 떠올리게 하는 것**이었다.
LLM 요약 + 두 패널 구조 + 안정적인 키보드 조작 + 한글이 깨지지 않는 인코딩, 이 네 가지가 갖춰져야 도구로서 의미가 있었다.

[`codex-resume`](https://github.com/ytkim4558/codex-resume)에서도 같은 결론에 도달한 흐름은 [별도 글](https://ytkim4558.github.io/codex-resume-tui-decision)에 정리돼 있다.

## 다음 과제

- `--all` 옵션 — 현재 디렉터리 외 다른 프로젝트 세션도 묶어서 표시
- 키워드 검색 (`/`로 시작) — Textual 내 inline filter
- 세션 삭제 (`d` 키) — JSONL과 캐시 항목 동시 제거, 확인 프롬프트
- 요약 모델 옵션화 — `claude -p` 대신 OpenAI/Gemini 등 선택 가능
- macOS / Linux 래퍼 — `.sh` 버전 (Python 본체는 이미 크로스플랫폼)

## 다른 AI 에이전트에게 남기는 메모

이 작업을 이어받는 AI 에이전트는 `claude-resume`을 단순 세션 ID picker로 보지 말고 **AI 작업 히스토리 브라우저**로 보면 된다.

- 두 패널 TUI 구조 (좌 리스트 / 우 전체 대화) 유지.
- 요약은 `claude -p` subprocess로 백그라운드 생성·캐시. 별도 API 키를 강제하지 않는다.
- 정렬용 시각은 항상 JSONL 내부 message timestamp 기준. 파일 mtime 기준으로 바꾸지 말 것.
- 요약 호출 자체가 새 세션을 만들기 때문에 프롬프트 마커로 반드시 자기 호출을 필터한다.
- CMD/PowerShell 양쪽 진입점 (`claude-resume.cmd`, `claude-resume.ps1`)을 함께 유지한다.
- 한글 인코딩은 PowerShell 래퍼에서 강제 (`PYTHONIOENCODING`, `PYTHONUTF8`, `[Console]::*Encoding`).
- 공개용 스크린샷은 원본 픽셀 좌표 기준으로 다시 검증한 뒤 redact. 다운스케일된 미리 보기 좌표로 판단하지 말 것.
- 상세 설계 문서는 [`claude-toolkit`](https://github.com/ytkim4558/claude-toolkit/blob/main/docs/tools/claude-resume.md)에 있다.


# Global Rules & AI Steering — ytkim

> Kiro, Claude, Codex 등 기존 에이전트들과의 855개+ 세션 프롬프트 분석 기반 통합 규칙.
> **AI는 아래 규칙을 0순위로 준수하며 절대 자의적으로 어기거나 다르게 해석하지 않는다.**

## 1. 대화 및 실행 규칙
- 한국어, 반말 OK. 짧고 직접적으로 답변. 장황한 설명 절대 금지.
- **"해줘" = 즉시 실행. (위험을 핑계로 확인을 묻거나 수동으로 하라고 떠넘기지 말고 즉시 실행할 것!)**
- "확인해봐" = 파일/로그/상태 직접 읽어서 결과 보고
- "검색해봐" = web_search/web_fetch 필수. 추정 답변 절대 금지
- 모르면 "모른다" 하고 검색 후 답변
- 에러 붙여넣기 = 원인 분석 + 해결책 즉시 제시
- 스크린샷 언급 시 = 바탕화면(`C:\Users\ytkim\OneDrive\Desktop`) 최신 이미지 파일 직접 확인

## 2. 계정 분리 원칙 (필수 — 절대 규칙)
**yougif 영역** (개인/VR/취미):
- VTuber, VRChat, 방송, Relay Vanguard, 숏츠, 스트리밍, OBS, 치지직, 씨미, PC 트러블슈팅, 게임
- Commit author: `yougif <noreply>`
- GitHub Token: `GITHUB_TOKEN_YOUGIF` (SSH Host: `github.com-yougif`)
- 절대 금지: 본명, 회사 이메일 언급 금지

**ytkim4558 영역** (전문/비즈니스):
- AWS, Bedrock, 포트폴리오, LinkedIn, 업무 도구, 기술 블로그 (GitHubPageMaker), 일반 프로그래밍
- Commit author: `ytkim <noreply>` (또는 ytkim4558 계정 정보)
- GitHub Token: `GITHUB_TOKEN_YTKIM` (SSH Host: `github.com-ytkim`)
- 절대 금지: VRChat, 방송, 스트리밍, 아바타 등 취미 요소 절대 언급 금지

**전문 콘텐츠에서 용어 일반화 (Tier 시스템):**
- Tier 1 (기술 블로그): VRChat→VR, OBS→비디오 인코딩
- Tier 2 (포트폴리오): VR→그래픽 집약 워크로드, BSOD→Windows 커널 메모리 오류
- **완전 회피**: 방송/스트리밍/OBS/트위치/유튜브 라이브 → ytkim4558 전문 채널에서 절대 언급 금지!

## 3. 작업 패턴 및 디버깅
- OBS 프로파일: vrcboxing3 (VR복싱), 치지직프로 (배그) - 변경 후 `AppData\Roaming\obs-studio` 반드시 git commit
- 녹화: Fragmented MP4, 15분 분할. 경로: `G:\RelayVanguard녹화본`, `G:\배틀그라운드녹화본`
- BSOD 발생 시: 이벤트 뷰어 → Bugcheck → 드라이버 매칭 순서로 분석
- 토큰/키/AWS 자격증명은 절대 코드나 채팅에 노출 금지 (Windows 사용자 환경변수/레지스트리 이용)
- 시스템 환경변수 읽기: `[System.Environment]::GetEnvironmentVariable("KEY", "User")`

## 4. Cross-Agent Handoff (타 AI로 작업 넘기기)
- **다른 AI로 이어질 작업은 채팅 기억에 의존하지 말 것!**
- 각 프로젝트의 `AGENTS.md` (혹은 `.kiro/steering.md`)에 "무엇이 committed/pushed 됐고, 무엇이 로컬에만 있는지, 남은 작업은 무엇인지" 구체적으로 메모할 것.
- AI가 이 handoff 규칙을 놓치면 **"워크플로우 버그"**로 간주하고 즉시 원인을 파악해 수정할 것.

## 5. 자주 하는 실수 방지
- 모델 쿼터 초과(에러)나 난이도가 너무 높은 작업 발생 시, 즉시 알맞은 모델(Claude Sonnet 등)로 변경할 것을 사용자에게 제안할 것.
- 작업 전 반드시 현재 파일 내용을 읽고(확인 후) 진행할 것. 터미널 명령 전 목적을 한 줄로 설명.
- "바탕화면 봐봐" = 최신 캡처 파일 읽기.
- PowerShell 안 열릴 때 = Windows Search 인덱스 문제 가능성.

---
title: "Windows Terminal이 열리자마자 죽을 때 — DCOM 10010 에러와 재설치로 해결"
description: "Windows 11에서 Windows Terminal이 실행 직후 조용히 종료되는 문제를 겪었다. 마우스 포인터에 로딩 원이 잠깐 돌다가 사라지고, 창은 열리지 않는다. PowerShell도 기본 터미널이 WT로 설정돼 있어서 같이 안 열렸다."
pubDate: 2026-05-30
tags:
  - Troubleshooting
lang: ko
---

Windows 11에서 Windows Terminal이 실행 직후 조용히 종료되는 문제를 겪었다. 마우스 포인터에 로딩 원이 잠깐 돌다가 사라지고, 창은 열리지 않는다. PowerShell도 기본 터미널이 WT로 설정돼 있어서 같이 안 열렸다.

## 증상

- 시작 메뉴에서 PowerShell / Terminal 클릭 → 로딩 커서만 잠깐 뜨고 사라짐
- `Win+R` → `wt` → 동일 증상
- 이벤트 뷰어 System 로그에 **Event ID 10010** 반복:
  ```
  The server {E12CFF52-A866-4C77-9A90-F570A7AA2C6B} did not register with DCOM within the required timeout.
  ```
- `Start-Process wt -PassThru` 실행 시 프로세스가 exit code 0으로 즉시 종료 (크래시가 아닌 정상 종료 코드)

## 원인

`{E12CFF52-A866-4C77-9A90-F570A7AA2C6B}`는 Windows Terminal의 DelegationTerminal CLSID다. WT가 DCOM에 제대로 등록되지 못해 시스템이 타임아웃을 발생시킨 것.

직접적 원인은 `settings.json`에 유효하지 않은 값이 들어간 것이었다:

```json
"rendering.graphicsAPI": "software"
```

WT가 허용하는 값은 `automatic | direct2d | direct3d11`뿐이다. 잘못된 값이 들어가면 WT는 설정 파싱 단계에서 실패하고 조용히 종료한다.

## 시도한 것들 (효과 없음)

| 시도 | 결과 |
|------|------|
| `chcp 65001` | 폰트 깨짐과 무관 |
| settings.json에서 잘못된 키 제거 | 여전히 안 열림 |
| `Reset-AppxPackage` | 여전히 안 열림 |
| state.json 삭제 | 여전히 안 열림 |

## 해결: 완전 재설치

```powershell
# 1. 제거
Get-AppxPackage Microsoft.WindowsTerminal | Remove-AppxPackage

# 2. 재등록
Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.WindowsTerminal_8wekyb3d8bbwe
```

재설치 후 정상 실행 확인.

## 임시 우회: 기본 터미널을 conhost로 변경

WT가 안 열리는 동안 PowerShell을 쓰려면 기본 터미널을 Windows Console Host로 변경한다:

```powershell
$reg = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty $reg -Name 'DelegationConsole' -Value '{2EACA947-7F5F-4CFA-BA87-8F7FBEEFBE69}'
Set-ItemProperty $reg -Name 'DelegationTerminal' -Value '{2EACA947-7F5F-4CFA-BA87-8F7FBEEFBE69}'
```

복원할 때:

```powershell
Set-ItemProperty $reg -Name 'DelegationConsole' -Value '{2EACA947-7F5F-4CFA-BA87-8F7FBEEFBE69}'
Set-ItemProperty $reg -Name 'DelegationTerminal' -Value '{E12CFF52-A866-4C77-9A90-F570A7AA2C6B}'
```

## 교훈

- WT의 `settings.json`에 유효하지 않은 값을 넣으면 **에러 팝업 한 번 보여주고 기본 설정으로 폴백**하는 게 아니라, 상황에 따라 **아예 실행이 안 될 수 있다**.
- `Reset-AppxPackage`로 부족하면 `Remove` → `Add`로 완전 재설치해야 한다.
- DCOM 10010 에러에서 CLSID가 `{E12CFF52-...}`이면 Windows Terminal 문제를 의심할 것.

## 환경

- Windows 11 Pro 25H2
- Windows Terminal 1.24.11321.0
- NVIDIA RTX 5090, 드라이버 596.49

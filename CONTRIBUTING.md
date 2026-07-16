# Gather Frontend 협업 규칙

## 브랜치와 작업 흐름

- `develop`은 기본 개발 브랜치입니다.
- `main`은 배포 대상 브랜치입니다.
- 일반 작업은 최신 `develop`에서 작업 브랜치를 만들고, `develop`을 대상으로 PR을 엽니다.

작업 브랜치는 아래 prefix만 사용합니다.

```txt
feat/*
fix/*
refactor/*
chore/*
docs/*
```

기본 흐름은 다음과 같습니다.

```txt
develop 최신화
→ 작업 브랜치 생성
→ 작업 및 커밋
→ develop 대상 PR
→ 리뷰 및 검사
→ merge
```

`develop`과 `main`에 직접 push하지 않습니다.

## 커밋과 PR 제목

커밋 메시지와 PR 제목은 같은 형식을 사용합니다.

```txt
type: 작업 내용
```

`type`은 작업 성격에 맞게 `feat`, `fix`, `refactor`, `chore`, `docs` 등을 사용합니다. 작업 내용은 한글로 간결하게 작성합니다.

예시:

```txt
feat: 이메일 로그인 화면 구현
fix: 팀 생성 validation 오류 수정
docs: 아키텍처 문서 정리
```

## PR 규칙

- PR 본문에는 작업 내용, 주요 변경 사항, 확인 방법, 관련 이슈를 작성합니다.
- 화면 변경은 필요한 경우에만 스크린샷 또는 녹화로 설명합니다.
- 리뷰와 필수 검사가 완료된 뒤 merge합니다. merge 방식과 branch protection의 세부 기준은 저장소 설정을 따릅니다.

## PR 전 검사

```bash
npm run format:check
npm run lint
npm run build
```

## 최소 완료 기준

- 변경 범위와 기존 동작에 미치는 영향을 직접 확인합니다.
- 관련된 로딩·오류·빈 상태와 접근성 동작을 필요한 범위에서 확인합니다.
- 위 검사를 실행하고, 실패한 경우 원인과 영향 범위를 PR에 공유합니다.

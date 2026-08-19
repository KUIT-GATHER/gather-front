# Gather Frontend 협업 규칙

## 브랜치

- `develop`: 기본 개발 브랜치
- `main`: 배포 브랜치

일반 작업은 최신 `develop`에서 작업 브랜치를 생성하고 `develop`을 대상으로 PR을 엽니다.

작업 브랜치는 아래 형식을 사용합니다.

```text
feat/*
fix/*
refactor/*
chore/*
docs/*
test/*
```

예시:

```text
feat/email-login
fix/team-filter-scroll
refactor/auth-session
docs/testing-guide
```

`develop`과 `main`에는 직접 push하지 않습니다.

## 작업 흐름

```text
develop 최신화
→ 작업 브랜치 생성
→ 구현
→ 로컬 검증
→ 커밋
→ develop 대상 PR
→ 리뷰 및 CI
→ merge
```

## 커밋 메시지

커밋 메시지는 다음 형식을 사용합니다.

```text
type: 작업 내용
```

주요 type:

```text
feat
fix
refactor
test
docs
chore
```

예시:

```text
feat: 이메일 로그인 화면 구현
fix: 모임 필터 스크롤 위치 수정
refactor: 인증 세션 복원 로직 정리
test: 로그인 세션 테스트 보강
docs: 테스트 전략 문서 추가
```

하나의 커밋에는 가능한 한 하나의 논리적 변경을 담습니다.

기능 변경, 구조 리팩터링, 도구 설정 변경은 필요한 경우 별도 커밋으로 분리합니다.

## Pull Request

PR 제목도 커밋과 동일한 형식을 사용합니다.

```text
type: 작업 내용
```

PR 본문에는 다음 내용을 중심으로 작성합니다.

- 무엇을 변경했는지
- 구현 또는 수정에서 중요한 부분
- 확인이 필요한 사항
- 관련 이슈

UI 변경이 리뷰에 영향을 주는 경우 스크린샷이나 영상을 첨부합니다.

작은 변경에 불필요하게 긴 설명을 작성할 필요는 없습니다.

## PR 전 검증

기본 검증은 다음 명령으로 실행합니다.

```bash
npm run verify
```

라우팅, 인증, navigation, 주요 사용자 흐름을 변경했다면 필요에 따라 다음 테스트도 실행합니다.

```bash
npm run test:storybook
npm run test:e2e
```

## 완료 기준

PR을 열기 전에 다음을 확인합니다.

- 변경한 기능이 의도대로 동작하는지 확인합니다.
- 관련된 loading, error, empty 상태를 필요한 범위에서 확인합니다.
- 기존 공용 UI를 변경했다면 주요 사용처에 영향이 없는지 확인합니다.
- 필요한 테스트를 실행합니다.
- `npm run verify`를 통과합니다.
- 실패한 검사가 있다면 원인과 영향 범위를 PR에 작성합니다.

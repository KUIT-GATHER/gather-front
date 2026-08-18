# AGENTS.md

Gather 프론트엔드 저장소에서 작업할 때 지켜야 하는 기본 규칙입니다.

현재 코드가 프로젝트 동작의 기준입니다.
필요한 경우 `README.md`, `CONTRIBUTING.md`, `docs/architecture.md`, `docs/testing.md`를 참고합니다.
문서와 코드가 다르면 현재 코드를 기준으로 판단하고 발견한 차이를 작업 결과에 기록합니다.

## 아키텍처

- `src/pages`는 라우트 진입점 역할을 담당하고 가능한 한 얇게 유지합니다.
- feature 전용 UI, API, hook, 상태, 도메인 로직은 `src/features/{feature}`에 둡니다.
- 여러 영역에서 재사용하며 특정 feature에 속하지 않는 인프라, 설정, 유틸, 공용 UI는 `src/shared`에 둡니다.
- 현재 기능에만 필요한 코드를 미래의 재사용 가능성만으로 `shared`에 이동하지 않습니다.
- feature 간 또는 `shared`와 feature 간 의존성이 필요한 경우 기존 구조를 먼저 따르고, 불필요한 양방향 의존은 만들지 않습니다.
- 의존성 문제를 해결하기 위해 현재 작업 범위를 벗어난 대규모 구조 변경은 하지 않습니다.
- 기존 구조로 해결할 수 있는 작업에 새로운 아키텍처 계층이나 범용 추상화를 추가하지 않습니다.

## UI

- 새로운 공용 UI를 만들기 전에 `src/shared/ui`의 기존 컴포넌트를 확인합니다.
- Button, Input, Dialog 같은 공용 UI를 feature 내부에 중복 구현하지 않습니다.
- 특정 도메인이나 비즈니스 규칙에 의존하는 UI는 해당 feature에 둡니다.
- 기존 variant, 디자인 토큰, Tailwind utility를 우선 사용합니다.
- 조건부 className 조합에는 프로젝트의 `cn` 유틸을 사용합니다.
- 공용 UI를 수정할 때는 기존 사용처에 미치는 영향을 함께 확인합니다.
- label, 키보드 조작, focus, disabled 상태 등 기존 접근성을 훼손하지 않습니다.

## 서버 상태와 API

- UI 컴포넌트에서 API 요청을 직접 호출하지 않습니다.
- feature API 함수는 해당 feature의 `api` 폴더에 둡니다.
- 서버 상태는 TanStack Query를 사용합니다.
- 기존 query key와 query options 패턴을 따릅니다.
- production UI에서 mock 데이터를 직접 import하지 않습니다.
- 기존 `fetchClient` 요청 흐름을 우선 사용합니다.

## 인증과 환경 변수

- 환경 변수는 `src/shared/config/env.ts`를 통해 접근합니다.
- `.env.local`과 실제 비밀값을 커밋하지 않습니다.
- 환경 변수 항목이 변경되면 `.env.example`을 함께 수정합니다.
- 인증 세션 정리 시 기존 인증 흐름을 우회하지 않습니다.
- 인증 상태를 초기화할 때 사용자별 Query Cache가 남지 않도록 합니다.

## 라우팅

- 라우트 정의는 `src/app/router.tsx`에서 관리합니다.
- 인증이 필요한 라우트에는 기존 `RequireAuth`를 사용합니다.
- feature 내부에 별도의 라우팅 구조를 만들지 않습니다.

## 변경 원칙

- 현재 작업과 무관한 사용자 또는 다른 작업자의 변경을 수정하거나 되돌리지 않습니다.
- 관련 없는 리팩터링, 포맷 변경, 설정 변경을 함께 수행하지 않습니다.
- 기능 변경과 큰 구조 리팩터링을 불필요하게 섞지 않습니다.
- 새로운 추상화보다 기존 프로젝트 패턴을 우선합니다.
- 기존 의존성으로 해결할 수 있으면 새 패키지를 추가하지 않습니다.
- 미래 기능을 위한 폴더, abstraction, placeholder를 미리 만들지 않습니다.
- `develop` 또는 `main`에 직접 push하지 않습니다.

## 테스트

테스트의 역할과 작성 기준은 `docs/testing.md`를 따릅니다.

동일한 동작을 Vitest, Storybook, Playwright에서 이유 없이 중복 검증하지 않습니다.

## 검증

코드 변경 후 다음 명령을 실행합니다.

```bash
npm run verify
```

브라우저 동작이나 주요 사용자 흐름을 변경했다면 관련 Storybook Browser Test 또는 Playwright E2E도 실행합니다.

검사가 실패하면 이번 변경으로 발생한 문제인지 기존 문제인지 구분해 보고합니다.

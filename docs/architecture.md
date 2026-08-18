# Frontend Architecture

## 1. 목적

이 문서는 Gather 프론트엔드의 현재 구조와 코드 배치 기준을 설명합니다.

새로운 아키텍처를 정의하기보다 현재 프로젝트에서 일관되게 작업하기 위한 기준을 제공합니다.

실제 동작과 파일 위치는 현재 코드를 source of truth로 사용합니다.

## 2. 전체 구조

```text
src/
├── app/
├── pages/
├── features/
├── shared/
├── mocks/
└── assets/
```

### `app`

애플리케이션 전역 구성을 담당합니다.

주요 역할:

- Router
- Layout
- Provider
- 앱 초기화

전체 라우트는 `src/app/router.tsx`에서 관리합니다.

### `pages`

라우터가 직접 렌더링하는 진입점입니다.

가능한 한 얇게 유지하며 실제 기능과 UI 구현은 feature에 위임합니다.

### `features`

기능과 도메인별 구현을 관리합니다.

예:

```text
auth
home
team
volunteer
my
notification
category
region
activity
```

feature 내부에는 실제 필요한 폴더만 사용합니다.

예:

```text
features/{feature}/
├── api/
├── components/
├── hooks/
├── lib/
├── schemas/
├── store/
└── types/
```

모든 feature가 동일한 하위 구조를 가질 필요는 없습니다.

### `shared`

특정 feature에 속하지 않고 여러 영역에서 사용하는 코드를 관리합니다.

예:

- API client
- 환경 변수 설정
- QueryClient
- 공용 UI
- 공통 utility
- 공통 constant

### `mocks`

MSW handler와 테스트·개발용 mock 데이터를 관리합니다.

### `assets`

코드에서 import해 사용하는 정적 자산을 관리합니다.

## 3. 코드 배치 기준

코드의 위치는 재사용 횟수보다 책임과 변경 이유를 기준으로 판단합니다.

특정 feature의 비즈니스 규칙에 의존한다면 해당 feature에 둡니다.

여러 feature에서 사용하더라도 특정 도메인의 의미를 가지고 있다면 무조건 `shared`로 이동하지 않습니다.

현재 한 feature에서만 사용하는 코드도 미래에 재사용할 가능성이 있다는 이유만으로 미리 `shared`에 이동하지 않습니다.

## 4. Feature 간 의존성

Gather는 모든 feature가 완전히 독립된 구조를 목표로 하지 않습니다.

사용자 화면이나 mutation 결과에 따라 다른 도메인의 데이터가 함께 필요한 경우 feature 간 의존이 발생할 수 있습니다.

예를 들어 마이페이지는 봉사 공고와 모임 데이터를 함께 조합할 수 있고, 특정 mutation 이후 여러 feature의 Query Cache를 갱신해야 할 수 있습니다.

따라서 feature 간 의존 자체를 금지하지 않습니다.

다만 다음 기준을 사용합니다.

- 한 기능을 구현하기 위해 여러 feature의 내부 구현을 과도하게 연결하지 않습니다.
- 동일한 두 feature가 서로를 반복적으로 참조하는 구조는 가능한 한 피합니다.
- 공통 책임으로 분리하는 편이 명확한 경우에만 별도 공통 영역을 검토합니다.
- 의존성 하나를 제거하기 위해 프로젝트 전체 구조를 변경하지 않습니다.
- 새로운 abstraction은 실제 반복이나 책임 분리가 확인된 이후에 도입합니다.

`category`, `region`, `activity`처럼 여러 기능에서 사용되는 모듈도 현재 프로젝트에서는 feature 구조 안에 존재합니다.

이들을 단순히 위치만 보고 독립된 business feature라고 가정하지 않습니다.

프로젝트 규모가 커지고 의존성 관리가 실제 문제로 커질 경우 별도의 domain/shared layer 또는 FSD와 같은 구조를 다시 검토할 수 있지만 현재는 기존 구조를 유지합니다.

## 5. API 요청 흐름

일반적인 서버 요청 흐름은 다음과 같습니다.

```text
Page / Component
        ↓
Feature Hook
        ↓
Query / Mutation
        ↓
Feature API
        ↓
shared fetchClient
        ↓
Backend API
```

UI 컴포넌트에서 직접 `fetch`를 호출하는 방식은 사용하지 않습니다.

Feature API 함수는 해당 feature의 `api` 폴더에 둡니다.

## 6. TanStack Query

서버 상태는 TanStack Query를 사용합니다.

전역 QueryClient와 공통 정책은 `src/shared/query`에서 관리합니다.

Feature별 query key와 query options는 기존 패턴을 따릅니다.

대표적으로 다음 형태를 사용합니다.

```text
features/{feature}/api/{feature}.queries.ts
```

Query hook은 필요한 경우 query options를 재사용하는 얇은 wrapper로 유지합니다.

개별 query의 캐시 정책이 전역 기본값과 달라야 하는 경우 해당 query options에서 명시적으로 재정의합니다.

Mutation은 기본적으로 자동 재시도하지 않습니다.

## 7. 오류 처리

서버 데이터 조회 실패와 사용자 action 실패를 구분합니다.

조회 실패는 화면 상태에서 처리하는 것을 기본으로 합니다.

예:

```text
LoadingState
ErrorState
EmptyState
```

생성, 수정, 삭제와 같은 mutation 실패는 사용자 action의 결과이므로 필요한 경우 Toast를 사용합니다.

전역 QueryClient는 공통 logging과 공통 mutation toast 처리를 지원하며, 화면별 구체적인 오류 표현은 해당 feature에서 결정합니다.

## 8. 인증

인증 상태는 Zustand에서 관리합니다.

앱 시작 시 refresh cookie를 이용해 기존 세션 복원을 시도합니다.

API 요청 중 access token 만료가 확인되면 기존 refresh 흐름을 이용해 세션을 복구하고 요청을 다시 시도합니다.

로그아웃 또는 세션 무효화 시 인증 상태만 제거하지 않고 사용자별 TanStack Query Cache도 함께 정리합니다.

이를 통해 이전 사용자의 서버 상태가 다음 세션에 남지 않도록 합니다.

## 9. 라우팅

전체 route 구성은 `src/app/router.tsx`에서 관리합니다.

공개 라우트는 인증 세션 초기화 때문에 불필요하게 렌더링이 차단되지 않도록 합니다.

인증이 필요한 화면에는 기존 `RequireAuth` route guard를 사용합니다.

feature 내부에서 별도의 독립 라우팅 시스템을 만들지 않습니다.

## 10. 폼과 검증

폼은 React Hook Form을 사용하고 schema validation은 Zod를 사용합니다.

복잡한 validation을 UI 컴포넌트 내부에 직접 작성하지 않고 feature의 schema 또는 lib 영역으로 분리합니다.

## 11. 공용 UI

재사용 가능한 UI primitive는 `src/shared/ui`에서 관리합니다.

예:

```text
Button
Input
Dialog
PageHeader
LoadingState
ErrorState
EmptyState
```

특정 feature의 데이터 구조나 비즈니스 규칙에 의존하면 공용 UI가 아니라 해당 feature에 둡니다.

공용 UI에 새로운 variant를 추가할 때는 하나의 화면을 위한 예외인지 반복 가능한 디자인 규칙인지 먼저 확인합니다.

## 12. MSW

MSW handler와 mock 데이터는 `src/mocks`에서 관리합니다.

production UI가 mock 데이터를 직접 import하지 않습니다.

개발 및 테스트에서도 가능한 한 실제 API와 동일한 요청 경로를 사용합니다.

## 13. Storybook

Story는 실제 컴포넌트 옆에 `*.stories.tsx` 형태로 colocate합니다.

Storybook은 다음 역할을 담당합니다.

- 공용 UI 상태 확인
- feature UI의 주요 상태 확인
- 브라우저 렌더링 확인
- 접근성 확인
- 필요한 interaction test

API 상태가 필요하면 실제 서버 대신 MSW handler를 사용합니다.

실제 route, 인증, navigation 전체 흐름은 Playwright에서 검증합니다.

## 14. 구조 변경 기준

다음 이유만으로 새로운 구조를 추가하지 않습니다.

- 언젠가 재사용할 것 같음
- 더 큰 프로젝트에서 일반적으로 사용함
- 특정 아키텍처 패턴을 적용하고 싶음

현재 코드에서 반복되는 문제나 명확한 책임 충돌이 확인되고 기존 구조로 해결하기 어려울 때 구조 변경을 검토합니다.

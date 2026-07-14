# Gather Frontend Architecture

## 1. 구조 개요

Gather Frontend는 다음 계층을 중심으로 구성합니다.

- `app`: Router, layout, 전역 Provider
- `pages`: 라우터가 직접 렌더링하는 페이지
- `features`: 기능과 도메인별 구현
- `shared`: 여러 영역에서 재사용하는 UI와 공통 인프라
- `mocks`: MSW handler와 mock 데이터
- `assets`: 코드에서 import하는 정적 자산

실제 파일 구조와 라우트 구성은 코드를 source of truth로 사용합니다.

## 2. 코드 배치 원칙

페이지 컴포넌트는 라우트 진입점 역할만 담당하고 가능한 한 얇게 유지합니다.

기능별 UI, 상태, API, 검증 로직은 해당 `features/{feature}`에 둡니다. 여러 기능에서 재사용되며 특정 도메인에 속하지 않는 코드는 `shared`에 둡니다.

Feature 내부에는 필요한 폴더만 만듭니다.

```txt
features/{feature}/
├── api/
├── components/
├── hooks/
├── schemas/
├── store/
└── types/
```

## 3. 라우팅과 인증

전체 라우트와 layout 구성은 [`src/app/router.tsx`](../src/app/router.tsx)를 기준으로 확인합니다.

공개 페이지는 인증 세션 복원 중에도 렌더링합니다. 인증이 필요한 라우트에만 `RequireAuth`를 적용하며, 인증 초기화와 비로그인 사용자의 이동은 route guard에서 처리합니다.

전역 Provider 구성과 인증 세션 복원은 `src/app/providers`에서 관리합니다.

## 4. API와 서버 상태

UI 컴포넌트에서 `fetch`를 직접 호출하지 않습니다.

일반적인 요청 흐름은 다음과 같습니다.

```txt
UI
→ feature hook
→ feature query 또는 mutation
→ feature API
→ shared fetchClient
```

API 요청 함수는 해당 feature의 `api` 폴더에 두며, 서버 상태는 TanStack Query로 관리합니다.

## 5. TanStack Query

전역 QueryClient와 공통 정책은 `src/shared/query`에서 관리합니다.

Feature별 query key와 query options는 다음 위치에 함께 둡니다.

```txt
features/{feature}/api/{feature}.queries.ts
```

Query hook은 정의된 query options를 재사용하는 얇은 wrapper로 유지합니다. Query key는 feature 단위의 상위 key에서 목록과 상세 데이터 단위로 확장합니다.

개별 query의 캐시 정책이 전역 기본값과 달라야 하는 경우 feature query options에서 재정의합니다.

전역 오류 처리는 공통 로깅을 담당하고, 사용자에게 보여주는 오류 UI와 폼 오류는 각 화면 또는 feature에서 처리합니다.

Mutation은 중복 요청 가능성을 고려하여 기본적으로 자동 재시도하지 않습니다.

## 6. 인증 세션과 캐시

인증 세션은 Zustand에서 관리하며, 앱 시작 시 refresh cookie를 이용해 세션 복원을 시도합니다.

로그아웃하거나 세션이 무효화되면 인증 상태와 TanStack Query의 서버 상태 캐시를 함께 초기화합니다. 이를 통해 이전 사용자의 데이터가 다음 세션에 남지 않도록 합니다.

## 7. 폼과 검증

입력 폼은 React Hook Form과 Zod를 사용합니다.

Feature별 검증 schema는 해당 feature의 `schemas` 폴더에 두고, 컴포넌트 내부에 긴 검증 로직을 작성하지 않습니다.

## 8. MSW

MSW handler와 mock 데이터는 `src/mocks`에서 관리합니다.

UI는 mock 데이터를 직접 import하지 않으며, 실제 API와 동일한 요청 흐름을 통해 mock 응답을 사용합니다.

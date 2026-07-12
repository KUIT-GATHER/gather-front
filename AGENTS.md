# AGENTS.md

## 참고 문서

작업 전 [README](./README.md), [협업 규칙](./CONTRIBUTING.md), [아키텍처](./docs/architecture.md)를 확인합니다.

코드가 문서와 다르면 현재 코드를 기준으로 판단하고, 발견한 불일치는 작업 결과에 기록합니다.

## 핵심 기술

React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS, React Hook Form, Zod를 사용합니다.

## 명령

의존성 설치와 로컬 실행에는 다음 명령을 사용합니다.

```bash
npm install
npm run dev
```

변경 후에는 반드시 다음 명령을 실행합니다.

```bash
npm run format:check
npm run lint
npm run build
```

검사가 실패하면 실패 원인과 이번 변경의 관련 여부를 구분해 보고합니다.

## 코드 배치

* `src/app`에는 router, layout, 전역 Provider를 둡니다.
* `src/pages`에는 라우터가 직접 렌더링하는 얇은 페이지 컴포넌트를 둡니다.
* 실제 UI와 도메인 로직은 `src/features/{feature}`에 둡니다.
* 여러 feature에서 재사용하는 인프라, UI, 설정, 유틸은 `src/shared`에 둡니다.
* 사용하지 않는 feature 하위 폴더나 미래 기능용 placeholder를 미리 만들지 않습니다.
* 현재 기능에만 필요한 코드를 재사용 가능성만으로 `shared`에 이동하지 않습니다.

## 공용 UI와 디자인 시스템

* 새로운 UI 컴포넌트를 만들기 전에 `src/shared/ui`에 사용할 수 있는 컴포넌트가 있는지 확인합니다.
* Button, Input, Dialog 같은 공용 UI primitive를 feature 내부에 중복 구현하지 않습니다.
* 특정 feature의 데이터나 비즈니스 규칙에 의존하는 컴포넌트는 공용 UI가 아니라 해당 feature에 둡니다.
* 여러 feature에서 재사용되고 비즈니스 도메인에 의존하지 않는 컴포넌트만 `shared/ui`로 분리합니다.
* 특정 페이지 하나를 위해 공용 컴포넌트에 페이지 전용 boolean props나 스타일 props를 계속 추가하지 않습니다.
* 기존 `variant`, `size`, `className` 조합으로 해결할 수 있는지 먼저 확인하고, 새로운 variant는 반복 가능한 디자인 규칙일 때만 추가합니다.
* 공용 컴포넌트의 조건부 className 조합에는 프로젝트의 `cn` 유틸을 사용합니다.
* 색상, 간격, radius, typography는 기존 Tailwind 유틸과 프로젝트에 정의된 디자인 토큰을 우선 사용합니다.
* 기존 디자인 토큰으로 표현할 수 있는 값을 임의의 색상 코드나 arbitrary value로 중복 추가하지 않습니다.
* 공용 UI를 수정할 때는 해당 컴포넌트의 기존 사용처에 미치는 영향을 함께 확인합니다.
* Figma 요구사항과 기존 공용 UI가 다르면 공용 컴포넌트를 바로 변경하지 않고, 재사용 가능한 variant인지 feature 전용 조합인지 먼저 판단합니다.
* label 연결, 키보드 조작, focus, disabled 상태 등 기존 접근성 동작을 훼손하지 않습니다.

## 서버 상태와 API

* UI 컴포넌트에서 API 요청을 직접 호출하지 않습니다.
* feature API 함수는 `src/features/{feature}/api`에 둡니다.
* 서버 상태는 TanStack Query를 우선 사용합니다.
* 서버 상태 hook은 `src/features/{feature}/hooks`에 둡니다.
* feature query key와 query options는 `src/features/{feature}/api/{feature}.queries.ts`에 둡니다.
* query hook은 가능한 한 query options를 재사용하는 얇은 wrapper로 유지합니다.
* mock 데이터를 UI에서 직접 import하지 않고 feature API와 `shared/api/fetchClient.ts` 요청 흐름을 사용합니다.

## 환경 변수와 인증

* 환경 변수는 컴포넌트나 feature에서 직접 `import.meta.env`로 읽지 않습니다.
* 환경 변수는 `src/shared/config/env.ts`를 통해 접근합니다.
* 실제 값이 있는 `.env.local`은 커밋하지 않습니다.
* 환경변수 예시가 변경되면 `.env.example`을 함께 수정합니다.
* 인증 세션을 종료할 때 기존 `clearAuthSession()`을 우회해 인증 store만 초기화하지 않습니다.
* 인증 상태와 사용자별 Query Cache가 함께 정리되어야 합니다.

## 라우팅

* 라우트 정의는 `src/app/router.tsx`에서 관리합니다.
* 인증이 필요한 라우트에는 기존 `RequireAuth`를 사용합니다.
* 공개 페이지 렌더링을 전역 인증 초기화로 차단하지 않습니다.
* feature 내부에 별도의 독립 라우트 구성을 만들지 않습니다.

## 주의사항

* `develop` 또는 `main`에 직접 push하지 않습니다.
* 현재 작업과 무관한 코드, 설정, 포맷을 대규모로 변경하지 않습니다.
* 사용자나 다른 작업자가 만든 변경사항을 임의로 되돌리지 않습니다.
* 기능 변화가 없는 리팩토링과 기능 변경을 한 작업에 불필요하게 섞지 않습니다.
* 새 패키지를 추가하기 전에 기존 의존성으로 해결할 수 있는지 확인합니다.
* 코드에서 확인되지 않은 미래 구조나 추상화를 미리 추가하지 않습니다.

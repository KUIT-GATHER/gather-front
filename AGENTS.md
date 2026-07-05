# AGENTS.md

## Project

Gather Frontend는 Vite + React + TypeScript 기반 프론트엔드 프로젝트입니다.

주요 기술 스택은 다음과 같습니다.

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* Tailwind CSS
* Zustand
* React Hook Form
* Zod

## Commands

작업 전후로 아래 명령어를 사용합니다.

```bash
npm install
npm run dev
npm run lint
npm run build
```

PR을 올리기 전에는 반드시 아래 명령어를 실행합니다.

```bash
npm run lint
npm run build
```

## Architecture

기본 구조는 아래 기준을 따릅니다.

```txt
src/
  app/
    layouts/
    providers.tsx
    router.tsx
  pages/
  features/
  shared/
  assets/
  mocks/
```

각 폴더의 역할은 다음과 같습니다.

* `src/app`: 앱 전체 라우터, 레이아웃, 전역 Provider를 관리합니다.
* `src/pages`: 라우터가 직접 참조하는 페이지 컴포넌트를 관리합니다.
* `src/features`: 기능별 실제 구현 코드를 관리합니다.
* `src/shared`: 여러 기능에서 재사용되는 공통 코드를 관리합니다.
* `src/assets`: 코드에서 import해서 사용하는 이미지와 아이콘을 관리합니다.
* `src/mocks`: MSW mock API와 mock 데이터를 관리합니다.

## Page and Feature Rules

페이지 컴포넌트는 최대한 얇게 유지합니다.

페이지에서는 복잡한 UI, API 요청, 비즈니스 로직을 직접 작성하지 않습니다. 실제 구현은 `features` 또는 `shared`로 분리합니다.

권장 흐름은 다음과 같습니다.

```txt
pages
→ features/*/components
→ features/*/hooks
→ features/*/api
→ shared/api
```

예시:

```txt
src/pages/volunteers/VolunteerListPage.tsx
→ src/features/volunteer/components/VolunteerList.tsx
→ src/features/volunteer/hooks/useVolunteerList.ts
→ src/features/volunteer/api/volunteerApi.ts
```

## Feature Folder Rules

feature 내부에서는 필요한 폴더만 사용합니다.

```txt
features/auth/
  api/
  components/
  hooks/
  schemas/
  store/
  types/
```

역할은 다음과 같습니다.

* `api`: 해당 기능의 API 요청 함수
* `components`: 해당 기능에서만 사용하는 UI 컴포넌트
* `hooks`: React Query hook 또는 custom hook
* `schemas`: Zod 기반 form validation schema
* `store`: 해당 기능 전용 Zustand store
* `types`: 해당 기능 전용 TypeScript 타입
* `constants`: 해당 기능 전용 상수

사용하지 않는 폴더를 억지로 만들 필요는 없습니다.

## Shared Folder Rules

`shared`는 여러 feature에서 재사용되는 코드만 둡니다.

```txt
shared/
  api/
  config/
  constants/
  hooks/
  lib/
  types/
  ui/
```

역할은 다음과 같습니다.

* `shared/ui`: Button, Input, Modal, Spinner, EmptyState 같은 공통 UI 컴포넌트
* `shared/api`: 공통 API client와 공통 API error 처리
* `shared/config`: env 등 앱 설정값
* `shared/constants`: 여러 기능에서 쓰는 공통 상수
* `shared/hooks`: 여러 기능에서 재사용되는 custom hook
* `shared/lib`: `cn`, 날짜 포맷 함수 같은 공통 유틸
* `shared/types`: 공통 API 응답 타입, 페이지네이션 타입 등

feature 전용 코드는 `shared`에 두지 않습니다.

## Import Rules

`src` 내부 import는 `@/` alias를 사용합니다.

```ts
import { cn } from "@/shared/lib/cn";
import { env } from "@/shared/config/env";
```

상대경로가 더 자연스러운 같은 폴더 내부 파일은 `./`를 사용할 수 있습니다.

```ts
import { TeamCard } from "./TeamCard";
```

## Environment Variables

환경변수 파일은 프로젝트 루트에 둡니다.

```txt
.env.local
.env.example
```

실제 값이 들어간 `.env.local`은 GitHub에 올리지 않습니다.

예시 파일인 `.env.example`만 GitHub에 올립니다.

환경변수는 컴포넌트나 feature에서 직접 `import.meta.env`로 접근하지 않습니다.

반드시 아래 파일을 통해 접근합니다.

```txt
src/shared/config/env.ts
```

사용 예시:

```ts
import { env } from "@/shared/config/env";

const apiUrl = env.API_BASE_URL;
```

## Styling Rules

스타일링은 Tailwind CSS를 기본으로 사용합니다.

공통 UI는 `shared/ui` 컴포넌트를 우선 사용합니다.

Button, Input, Modal, Spinner, EmptyState 같은 공통 UI를 feature 내부에서 중복 구현하지 않습니다.

조건부 className 조합에는 `cn` 유틸을 사용합니다.

```ts
import { cn } from "@/shared/lib/cn";
```

전역 스타일은 `src/index.css`에 최소한으로 작성합니다.

## API Rules

API 요청 함수는 각 feature의 `api` 폴더에 둡니다.

```txt
features/auth/api/authApi.ts
features/volunteer/api/volunteerApi.ts
features/team/api/teamApi.ts
```

React Query hook은 각 feature의 `hooks` 폴더에 둡니다.

```txt
features/volunteer/hooks/useVolunteerList.ts
features/team/hooks/useTeamDetail.ts
```

UI 컴포넌트에서 fetch를 직접 호출하지 않습니다.

## Form Rules

폼은 React Hook Form과 Zod를 사용합니다.

Zod schema는 각 feature의 `schemas` 폴더에 둡니다.

```txt
features/auth/schemas/loginSchema.ts
features/team/schemas/teamCreateSchema.ts
```

폼 검증 로직을 컴포넌트 내부에 길게 작성하지 않습니다.

## Mock Rules

MSW를 사용하는 경우 mock 관련 파일은 `src/mocks` 아래에 둡니다.

UI 컴포넌트에서 mock 데이터를 직접 import하지 않습니다.

mock 데이터도 실제 API 응답처럼 feature api와 hook을 통해 사용합니다.

권장 흐름:

```txt
UI
→ feature hook
→ feature api
→ shared api client
→ MSW handler
```

## Routing Rules

라우트 정의는 아래 파일에서 관리합니다.

```txt
src/app/router.tsx
```

라우트 그룹별 레이아웃은 아래 폴더에서 관리합니다.

```txt
src/app/layouts/
```

feature 내부에서 별도의 라우트 트리를 만들지 않습니다.

## Git Rules

기본 개발 브랜치는 `develop`입니다.

작업은 항상 `develop`에서 새 브랜치를 만들어 진행합니다.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/작업명
```

PR 대상 브랜치는 `develop`입니다.

커밋 메시지는 한글로 작성합니다.

예시:

```txt
feat: 로그인 화면 구현
fix: 팀 생성 validation 오류 수정
chore: 환경변수 설정 추가
docs: AI 작업 지침 추가
```

## Do Not

다음 작업은 피합니다.

* `develop` 또는 `main`에 직접 push하지 않습니다.
* 페이지 컴포넌트에 API 요청과 복잡한 비즈니스 로직을 직접 작성하지 않습니다.
* feature 전용 코드를 `shared`에 넣지 않습니다.
* 공통 UI 컴포넌트를 feature 내부에 중복 구현하지 않습니다.
* `import.meta.env`를 여러 파일에서 직접 사용하지 않습니다.
* mock 데이터를 UI에서 직접 import하지 않습니다.
* 사용하지 않는 거대한 추상화나 과한 폴더 구조를 만들지 않습니다.

## Reference Documents

자세한 구조와 팀 규칙은 아래 문서를 참고합니다.

```txt
docs/frontend-structure.md
docs/conventions.md
```

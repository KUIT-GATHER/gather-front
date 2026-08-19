# Gather Frontend

Gather 서비스의 프론트엔드 프로젝트입니다.

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- React Hook Form
- Zod
- MSW
- Vitest / React Testing Library
- Storybook
- Playwright

정확한 패키지와 버전은 [`package.json`](./package.json)을 기준으로 합니다.

## 실행 환경

패키지 관리는 npm을 사용합니다.

CI에서는 Node.js 24를 사용합니다.

## 설치

```bash
npm install
```

## 환경 변수

[`.env.example`](./.env.example)을 참고해 프로젝트 루트에 `.env.local`을 생성합니다.

```bash
cp .env.example .env.local
```

현재 사용 중인 주요 환경 변수는 다음과 같습니다.

| 변수                            | 설명                          |
| ------------------------------- | ----------------------------- |
| `VITE_API_BASE_URL`             | API 서버 기본 URL             |
| `VITE_ENABLE_MSW`               | MSW 사용 여부                 |
| `VITE_KAKAO_REST_API_KEY`       | 카카오 로그인 REST API 키     |
| `VITE_KAKAO_MAP_JAVASCRIPT_KEY` | 카카오 지도 JavaScript SDK 키 |

실제 환경 변수 목록과 형식은 [`.env.example`](./.env.example)을 기준으로 합니다.

`.env.local`과 실제 비밀값은 저장소에 커밋하지 않습니다.

## 개발 서버

```bash
npm run dev
```

## 주요 명령어

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check

npm run test
npm run test:run
npm run test:coverage

npm run storybook
npm run build-storybook
npm run test:storybook

npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed

npm run verify
```

### Playwright 최초 실행

브라우저가 설치되어 있지 않은 경우 Chromium을 설치합니다.

```bash
npx playwright install chromium
```

## 프로젝트 구조

```text
src/
├── app/
├── pages/
├── features/
├── shared/
├── mocks/
└── assets/
```

- `app`: router, layout, 전역 Provider
- `pages`: 라우트 진입점
- `features`: 기능과 도메인별 구현
- `shared`: 공용 UI와 인프라
- `mocks`: MSW handler와 mock 데이터
- `assets`: 코드에서 import하는 정적 자산

자세한 구조와 의존성 원칙은 [아키텍처 문서](./docs/architecture.md)를 참고합니다.

## 테스트

Vitest/RTL, Storybook Browser Test, Playwright를 테스트 목적에 따라 구분해 사용합니다.

자세한 기준은 [테스트 전략 문서](./docs/testing.md)를 참고합니다.

## Troubleshooting

개발 및 QA 과정에서 실제로 발생한 문제 중 단순한 증상 수정에 그치지 않고,
원인을 분석해 구조 개선과 회귀 검증까지 이어진 사례를 정리했습니다.

### 인증 Bootstrap과 Session Lifecycle 분리

비로그인 사용자의 앱 최초 진입에서도 토큰 재발급 API가 호출되며
불필요한 `401 Unauthorized`가 발생했습니다.

더 큰 문제는 초기 인증 복원 실패가 실제 세션 무효화와 동일하게 처리되면서
인증 상태뿐 아니라 TanStack Query Cache까지 함께 초기화되어,
공개 데이터의 불필요한 재요청으로 이어질 수 있다는 점이었습니다.

앱 최초 진입의 **Session Restore**와 로그인 이후의 **Token Refresh**를 분리하고,
동시 토큰 만료 시 중복 재발급 방지와 실제 세션 무효화 시의 Cache Lifecycle까지 함께 정비했습니다.

[상세 내용](./docs/troubleshooting/auth-session-lifecycle.md)

### Route-level Code Splitting으로 Production Bundle 개선

Production build에서 main JavaScript chunk가 약 `1.46 MB`까지 증가하고,
개발 환경에서만 사용하는 MSW browser chunk도 production output에 포함되는 문제를 확인했습니다.

사용자 이동 경계를 기준으로 상세·검색·작성·관리 화면을 React Router의 route-level lazy loading으로 분리하고,
MSW 및 개발 전용 코드를 development-only dynamic import로 격리했습니다.

그 결과 main JavaScript chunk를 `1,459.20 kB → 660.41 kB`로 약 **54.7% 감소**시켰고,
production output에서 `538.11 kB`의 MSW browser chunk도 제거했습니다.

[상세 내용](./docs/troubleshooting/bundle-code-splitting.md)

### MSW 환경의 실제 Backend 요청 유출 방지

전화번호 인증을 MSW 환경에서 테스트하던 중
SMS 앱 전환 이후 MSW client의 요청 가로채기가 끊기며
인증 confirm 요청이 실제 Backend로 전달될 수 있는 문제를 확인했습니다.

MSW 환경에서는 불필요한 SMS 앱 전환을 생략하고,
Gather 내부 API는 등록되지 않은 요청을 실제 서버로 전달하지 않는 **fail-closed** 정책을 적용했습니다.
반면 Kakao 등 외부 서비스 요청은 기존처럼 bypass하도록 Network Boundary를 분리했습니다.

[상세 내용](./docs/troubleshooting/msw-network-boundary.md)

## 협업

브랜치, 커밋, PR 규칙은 [협업 규칙](./CONTRIBUTING.md)을 참고합니다.

## 문서

- [아키텍처](./docs/architecture.md)
- [테스트 전략](./docs/testing.md)
- [협업 규칙](./CONTRIBUTING.md)
- [AI 작업 규칙](./AGENTS.md)

## PR 전 확인

```bash
npm run verify
```

변경 범위에 따라 필요한 Storybook Browser Test 또는 Playwright E2E도 실행합니다.

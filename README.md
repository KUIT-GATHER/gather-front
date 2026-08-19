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

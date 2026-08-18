# Gather Frontend

Gather 서비스의 프론트엔드 프로젝트입니다. React 기반 화면과 TanStack Query 기반 서버 상태를 관리합니다.

## 주요 기술

- React, TypeScript, Vite
- React Router
- TanStack Query, Zustand
- Tailwind CSS
- React Hook Form, Zod
- MSW
- Storybook (공용 UI 문서화와 독립 상태 확인)

정확한 패키지와 버전은 [package.json](./package.json)을 기준으로 합니다.

## 실행 요구사항

### Node.js

이 프로젝트는 Node.js 24를 기준으로 개발합니다.

루트의 `.nvmrc`를 통해 로컬 개발 환경의 Node.js major 버전을 맞춥니다. nvm을 사용하는 경우 프로젝트 루트에서 다음 명령어를 실행하세요.

```bash
nvm use
```

GitHub Actions CI에서도 Node.js 24를 사용합니다.

패키지 관리는 npm을 사용합니다.

## 설치와 환경 변수

```bash
npm install
```

`.env.example`을 참고해 루트에 `.env.local`을 만들고 필요한 값을 설정합니다. `.env.local`에는 실제 비밀값을 커밋하지 않습니다.

| 변수                            | 설명                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `VITE_API_BASE_URL`             | API 서버 기본 URL                                       |
| `VITE_ENABLE_MSW`               | `true`이면 MSW mock API 사용, `false`이면 실제 API 사용 |
| `VITE_KAKAO_REST_API_KEY`       | 카카오 로그인 인가 요청에 사용하는 REST API 키          |
| `VITE_KAKAO_MAP_JAVASCRIPT_KEY` | 카카오 지도 JavaScript SDK에 사용하는 앱 키             |

환경 변수의 실제 항목과 형식은 [.env.example](./.env.example)을 기준으로 합니다.

## 개발 서버

```bash
npm run dev
```

## 주요 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 타입 검사 및 프로덕션 빌드
npm run lint         # ESLint 검사
npm run test:run     # Vitest 테스트 실행
npm run test:coverage # Vitest 커버리지 생성
npm run format       # Prettier로 파일 포맷
npm run format:check # Prettier 형식 검사
npm run storybook    # Storybook 개발 서버
npm run build-storybook # Storybook 정적 빌드
npm run preview      # 빌드 결과 미리보기
```

Vitest와 React Testing Library는 컴포넌트 동작과 단위·통합 테스트를 담당하고, MSW는 API 경계를 재현합니다. Storybook은 공용 UI와 재사용 feature UI의 주요 시각 상태·접근성을 독립적으로 확인하며, 실제 route/auth/navigation 흐름은 Playwright가 담당합니다. Storybook은 안전한 dummy 환경 변수와 MSW를 사용하므로 실서버나 개인 Kakao API 키가 필요하지 않습니다.

브라우저 E2E 테스트를 실행하려면 최초 1회 Chromium을 설치합니다.

```bash
npx playwright install chromium
npm run test:e2e         # headless Chromium
npm run test:e2e:ui      # Playwright UI Mode
npm run test:e2e:headed  # 브라우저를 표시하며 실행
```

## 구조 한 줄 요약

라우터가 참조하는 얇은 `pages`와 도메인 구현을 담는 `features`, 공통 인프라·UI를 담는 `shared`로 구성합니다.

## 상세 문서

- [협업 규칙](./CONTRIBUTING.md)
- [프론트엔드 아키텍처](./docs/architecture.md)
- [AI 작업 규칙](./AGENTS.md)

## PR 전 확인

```bash
npm run format:check
npm run lint
npm run test:run
npm run build
npm run build-storybook
```

# Gather Frontend 구조 가이드

이 문서는 Gather 프론트엔드 프로젝트의 폴더 구조, 라우팅 구조, 레이아웃 역할, 코드 배치 기준을 정리한 문서입니다.

## 전체 구조

```txt
gather-front/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   ├── assets/
│   ├── features/
│   ├── mocks/
│   ├── pages/
│   ├── shared/
│   ├── index.css
│   └── main.tsx
├── docs/
│   ├── conventions.md
│   └── frontend-structure.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 핵심 진입 흐름

```txt
index.html
└── src/main.tsx
    ├── AppProviders
    └── RouterProvider
        └── src/app/router.tsx
```

- `src/main.tsx`: React 앱의 브라우저 진입점입니다.
- `src/index.css`: Tailwind import와 전역 스타일을 관리합니다.
- `src/app/providers.tsx`: 전역 Provider를 모으는 위치입니다.
- `src/app/router.tsx`: 전체 URL 라우팅을 정의합니다.
- `src/app/layouts/`: 라우트 그룹별 공통 레이아웃을 관리합니다.

## src/app

```txt
src/app/
├── layouts/
│   ├── AuthLayout.tsx
│   ├── MainTabLayout.tsx
│   ├── PlainLayout.tsx
│   └── RootLayout.tsx
├── providers.tsx
└── router.tsx
```

- `RootLayout`: 전체 라우트의 최상위 레이아웃입니다.
- `AuthLayout`: 온보딩, 로그인, 회원가입, 약관처럼 인증 전 흐름에 사용하는 레이아웃입니다.
- `MainTabLayout`: 홈, 모임, 마이페이지처럼 하단 탭이 있는 메인 화면에 사용하는 레이아웃입니다.
- `PlainLayout`: 검색, 상세, 생성, 알림처럼 하단 탭이 없는 단독 화면에 사용하는 레이아웃입니다.
- `providers.tsx`: TanStack Query Provider 등 전역 Provider를 관리합니다.
- `router.tsx`: React Router 라우트 구성을 관리합니다.

## src/pages

```txt
src/pages/
├── auth/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── TermsPage.tsx
├── entry/
│   └── EntryPage.tsx
├── home/
│   └── HomePage.tsx
├── my/
│   └── MyPage.tsx
├── notifications/
│   └── NotificationPage.tsx
├── onboarding/
│   └── OnboardingPage.tsx
├── teams/
│   ├── TeamCreatePage.tsx
│   ├── TeamDetailPage.tsx
│   ├── TeamPage.tsx
│   └── TeamSearchPage.tsx
└── volunteers/
    ├── VolunteerDetailPage.tsx
    ├── VolunteerListPage.tsx
    └── VolunteerSearchPage.tsx
```

`pages`는 라우터가 직접 참조하는 페이지 컴포넌트 계층입니다.

페이지 컴포넌트는 최대한 얇게 유지합니다. 실제 UI 조각, API 요청, 비즈니스 로직은 `features` 또는 `shared` 계층으로 분리합니다.

예시:

```txt
pages/volunteers/VolunteerListPage.tsx
→ features/volunteer/components/VolunteerList.tsx
→ features/volunteer/hooks/useVolunteerPosts.ts
→ features/volunteer/api/volunteerApi.ts
```

## src/features

```txt
src/features/
├── auth/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   ├── store/
│   └── types/
├── home/
│   ├── components/
│   ├── hooks/
│   └── types/
├── onboarding/
│   └── components/
├── team/
│   ├── api/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── schemas/
│   └── types/
└── volunteer/
    ├── api/
    ├── components/
    ├── constants/
    ├── hooks/
    └── types/
```

`features`는 기능 단위 코드를 모으는 영역입니다.

1차 기능 기준으로 다음 feature를 우선 사용합니다.

- `auth`: 로그인, 회원가입, 약관 동의, 인증 상태
- `onboarding`: 온보딩 화면 관련 UI
- `home`: 홈 화면, 추천 공고, 추천 모임, 홈 필터
- `volunteer`: 봉사 공고 목록, 검색, 상세
- `team`: 모임 목록, 검색, 생성, 상세

### Feature 하위 폴더 역할

- `api/`: 기능별 API 요청 함수
- `components/`: 해당 feature 전용 컴포넌트
- `constants/`: 필터 옵션, 탭 옵션, 상태값 등 상수
- `hooks/`: React Query hook 또는 feature 전용 custom hook
- `schemas/`: zod 기반 폼 검증 스키마
- `store/`: feature 전용 Zustand store
- `types/`: feature 전용 타입

사용하지 않는 하위 폴더는 무조건 만들지 않아도 됩니다.

## 2차 기능

다음 기능은 2차 구현 범위입니다.

- 마이페이지 상세 기능
- 프로필 수정
- 알림
- 채팅
- 모임 게시판
- 활동 후기
- 팀장 모임 관리
- 관리자 기능

2차 기능은 현재 시점에서 `pages`에 placeholder route만 만들어뒀습니다. 실제 구현 시점에 필요한 `features/my`, `features/notification`, `features/chat`, `features/admin` 등을 추가합니다.

## src/shared

```txt
src/shared/
├── api/
├── config/
├── constants/
├── hooks/
├── lib/
│   └── cn.ts
├── types/
└── ui/
```

`shared`는 여러 feature에서 재사용되는 공통 코드를 두는 영역입니다.

- `shared/ui`: Button, Input, Badge, Chip, BottomSheet 같은 공통 UI 컴포넌트
- `shared/api`: 공통 API 클라이언트, 공통 에러 처리
- `shared/hooks`: 여러 feature에서 재사용되는 custom hook
- `shared/lib`: `cn`, `formatDate` 같은 공통 유틸 함수
- `shared/constants`: 라우트, 공통 옵션 등 상수
- `shared/config`: env 등 설정값
- `shared/types`: 공통 API 응답 타입, 페이지네이션 타입 등

## src/mocks

```txt
src/mocks/
└── data/
```

`mocks`는 mock API를 관리하는 영역입니다.

UI 컴포넌트에서 mock 데이터를 직접 import하지 않습니다.

권장 흐름:

```txt
UI
→ feature hook
→ feature api
→ shared fetchClient
→ mock response
```

나중에 실제 API가 연결되어도 UI와 hook 구조를 크게 바꾸지 않기 위함입니다.

## src/assets

```txt
src/assets/
├── icons/
└── images/
```

- `icons/`: 앱 내부에서 사용하는 아이콘 에셋
- `images/`: 앱 내부에서 사용하는 이미지 에셋

`public/`에는 브라우저가 직접 접근해야 하는 정적 파일을 두고, 코드에서 import해서 사용하는 에셋은 `src/assets/`에 둡니다.

## 현재 라우트 목록

```txt
/                                  EntryPage
/onboarding                         OnboardingPage
/login                              LoginPage
/signup                             SignupPage
/terms                              TermsPage

/home                               HomePage

/teams                              TeamPage
/my                                 MyPage

/volunteers                         VolunteerListPage
/volunteers/search                  VolunteerSearchPage
/volunteers/:volunteerId            VolunteerDetailPage
/volunteers/:volunteerId/teams/new  TeamCreatePage

/teams/search                       TeamSearchPage
/teams/new                          TeamCreatePage
/teams/:teamId                      TeamDetailPage

/notifications                      NotificationPage
```

## 라우트별 레이아웃

```txt
RootLayout
├── /
│   └── EntryPage
│
├── AuthLayout
│   ├── /onboarding
│   ├── /login
│   ├── /signup
│   └── /terms
│
├── MainTabLayout
│   ├── /home
│   ├── /teams
│   └── /my
│
└── PlainLayout
    ├── /volunteers
    ├── /volunteers/search
    ├── /volunteers/:volunteerId
    ├── /volunteers/:volunteerId/teams/new
    ├── /teams/search
    ├── /teams/new
    ├── /teams/:teamId
    └── /notifications
```

## 주요 라우팅 의도

### `/`

앱 진입점입니다.

로그인 상태에 따라 이동합니다.

```txt
로그인 안 됨 → /onboarding
로그인 됨 → /home
```

### `/home`

로그인 후 홈 화면입니다.

홈 화면에서는 봉사 공고 추천, 모임 추천, 필터, 알림 진입 등을 제공합니다.

### `/volunteers`

봉사 공고 목록 화면입니다.

### `/volunteers/:volunteerId`

봉사 공고 상세 화면입니다.

해당 공고 설명과 함께, 해당 공고에 연결된 모임 목록을 보여줄 수 있습니다.

### `/volunteers/:volunteerId/teams/new`

특정 봉사 공고를 기반으로 모임을 만드는 화면입니다.

### `/teams`

하단 탭의 모임 화면입니다.

우리 모임과 모임 찾기 탭을 포함할 수 있습니다.

탭 상태는 query string으로 관리할 수 있습니다.

```txt
/teams?tab=my
/teams?tab=find
```

### `/teams/new`

특정 공고에 묶이지 않은 자유모임 만들기 화면입니다.

### `/teams/:teamId`

모임 상세 화면입니다.

1차에서는 placeholder로 두고, 2차에서 상세, 게시판, 후기, 팀장 관리 기능을 확장합니다.

## 구조 운영 원칙

- `pages`는 라우트 단위 화면만 담당합니다.
- `features`는 도메인 또는 기능별 실제 구현을 담당합니다.
- `shared`는 여러 feature에서 재사용되는 공통 코드를 담당합니다.
- `shared/ui`는 비즈니스 로직 없는 공통 UI 컴포넌트만 둡니다.
- feature 안의 하위 폴더는 필요한 경우에만 만듭니다.
- 1차 기능에서 사용할 가능성이 높은 빈 폴더는 `.gitkeep`으로 유지합니다.
- 2차 기능은 route placeholder만 두고, 실제 구현 시점에 feature 폴더를 확장합니다.
- mock 데이터는 UI에서 직접 import하지 않고 API 응답처럼 사용합니다.

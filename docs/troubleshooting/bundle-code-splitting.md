# Route-level Code Splitting으로 Production Bundle 개선

## 문제 상황

최종 QA 과정에서 Production Build 결과를 점검하던 중
Vite가 JavaScript Chunk Size Warning을 출력하는 것을 확인했습니다.

변경 전 주요 JavaScript Build Output은 다음과 같았습니다.

```text
browser-D782mKHX.js      538.11 kB │ gzip: 186.04 kB
index-B81eDAh9.js      1,459.20 kB │ gzip: 455.90 kB
```

Vite 역시 다음 경고를 출력하고 있었습니다.

```text
Some chunks are larger than 500 kB after minification.
```

Main Application Chunk가 약 `1.46 MB`까지 증가했고,
개발 환경에서만 사용하는 MSW 관련 코드도
별도의 `browser` Chunk로 Production Output에 포함되고 있었습니다.

단순히 Vite의 Warning 기준을 높여 메시지를 숨기기보다,
초기 Dependency Graph에 실제로 어떤 코드가 포함되고 있는지 분석했습니다.

---

## 원인 분석

### 1. Router가 대부분의 Page Dependency를 정적으로 참조

기존 `router.tsx`에서는 다수의 Page Component가
파일 상단에서 Static Import되고 있었습니다.

```ts
import { VolunteerSearchPage } from "...";
import { VolunteerDetailPage } from "...";

import { TeamDetailPage } from "...";
import { TeamPostDetailPage } from "...";
import { TeamPostEditorPage } from "...";
import { TeamRecruitEditorPage } from "...";
import { TeamSettingsPage } from "...";
import { TeamMemberManagementPage } from "...";

import { NotificationPage } from "...";
import { ProfileEditPage } from "...";
import { MyActivitiesPage } from "...";
import { MyBadgesPage } from "...";
```

사용자가 현재 `/home`이나 `/volunteers`처럼
주요 진입 화면만 보고 있더라도
Router Module이 로드되면서 상세, 작성, 설정, 관리 화면의 Dependency까지
초기 Application Graph에 연결되는 구조였습니다.

기능이 증가하면서 Router가 사실상
대부분의 Page Dependency를 한 번에 참조하는 진입점 역할을 하고 있었습니다.

---

### 2. MSW 관련 코드가 Production Build Output에 포함

MSW는 개발 및 테스트 환경에서만 필요한 도구입니다.

기존 코드 역시 Runtime에서는 개발 환경 여부를 확인하고 있었지만:

```ts
if (!env.IS_DEV || !env.ENABLE_MSW) {
  return;
}

const { worker } = await import("@/mocks/browser");
```

실제 Production Build Output에는 다음 Chunk가 생성되고 있었습니다.

```text
browser-*.js
538.11 kB
gzip: 186.04 kB
```

즉 다음 두 상태는 서로 다른 문제였습니다.

```text
"Production에서 실행되지 않는다"
```

```text
"Production Build Graph에 포함되지 않는다"
```

Production 사용자가 필요로 하지 않는 개발 도구라면
실행 여부뿐 아니라 Build Output에서도 분리하는 것이 적절하다고 판단했습니다.

---

## 해결 1. 사용자 이동 경계를 기준으로 Route Code Splitting

모든 Page를 무조건 Lazy Loading하지는 않았습니다.

사용자가 자주 접근하거나
Application의 주요 진입점 역할을 하는 화면은 Eager Loading을 유지했습니다.

예를 들면:

```text
Entry
Onboarding
Login
Signup
Home
Volunteer List
Team List
My Page
```

반면 사용자의 추가 행동 이후 접근하는 화면들은
Route-level Lazy Loading 대상으로 분리했습니다.

```text
Search
Detail
Create
Edit
Settings
Management
Notification
My Page 하위 화면
Account Recovery
```

React Router의 Route `lazy`와 Dynamic `import()`를 사용했습니다.

```ts
{
  path: "/volunteers/:volunteerId",
  lazy: {
    Component: async () =>
      (await import("@/pages/volunteers/VolunteerDetailPage"))
        .VolunteerDetailPage,
  },
}
```

이렇게 변경하면 해당 Page와 연결된 JavaScript는
사용자가 실제 Route에 진입할 때 로드됩니다.

---

## 해결 2. 규모가 큰 Team 하위 Route 분리

Team 기능은 단순 목록 화면 외에도
상세, 게시글, 활동, 작성, 설정, 멤버 관리 등
많은 하위 화면을 가지고 있습니다.

기존에는 이 Page들이 모두 Router의 Static Import에 연결되어 있었습니다.

이를 다음과 같이 Navigation Boundary에 맞춰 분리했습니다.

```text
Team
│
├─ Search
│
└─ Detail
   ├─ Home
   ├─ Posts
   ├─ Post Detail
   ├─ Post Editor
   ├─ Recruit Editor
   ├─ Activity
   │  ├─ Recruits
   │  ├─ Posts
   │  └─ Comments
   │
   └─ Settings
      ├─ Team Info
      ├─ Member Management
      ├─ Join Requests
      └─ Activity Management
```

사용자가 Team List만 확인하는 경우
작성 및 관리자 기능까지 초기 JavaScript로 다운로드할 필요가 없어졌습니다.

---

## 해결 3. MSW를 Development-only Dynamic Import로 격리

MSW 코드가 Production Dependency Graph에 포함되지 않도록
첫 번째 조건을 Vite의 Compile-time Flag인 `import.meta.env.DEV`로 변경했습니다.

```ts
async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }

  if (!env.ENABLE_MSW) {
    return;
  }

  const [{ worker }, { handleUnhandledRequest }] = await Promise.all([
    import("@/mocks/browser"),
    import("@/mocks/apiScope"),
  ]);

  return worker.start({
    onUnhandledRequest: handleUnhandledRequest,
  });
}
```

MSW Worker뿐 아니라
MSW Network Boundary 로직인 `apiScope` 역시
Development Branch 내부에서 Dynamic Import하도록 이동했습니다.

결과적으로 변경 후 Production Build에서는
기존 `browser-*.js` Chunk가 생성되지 않았습니다.

---

## 해결 4. 개발 전용 Route도 Lazy Loading

개발 중 Component를 확인하기 위해 사용하는 `/dev/components` 역시
Production 사용자에게 필요하지 않은 Route입니다.

기존 Static Import를 제거하고,
Development 환경에서만 Route를 생성하도록 변경했습니다.

```ts
const devRoutes = import.meta.env.DEV
  ? [
      {
        path: "/dev/components",
        lazy: {
          Component: async () =>
            (await import("@/pages/dev/ComponentTestPage")).ComponentTestPage,
        },
      },
    ]
  : [];
```

이를 통해 Dev Tooling이 Production Route Graph에
불필요하게 연결되지 않도록 했습니다.

---

## Code Splitting 이후 Loading Boundary 보완

Route-level Code Splitting은 초기 JavaScript 비용을 줄이는 대신,
아직 다운로드되지 않은 Route에 사용자가 접근할 때
해당 Module을 가져오는 시간이 새롭게 발생합니다.

특히 사용자가 Lazy Route URL로 직접 진입하는 경우
공통 Loading UI가 없다면
Page Module을 불러오는 동안 빈 화면처럼 보일 수 있습니다.

따라서 후속 작업에서 Router Root에
공통 `HydrateFallback`을 추가했습니다.

```tsx
export function RootHydrateFallback() {
  return (
    <LoadingState
      className="min-h-dvh bg-bg"
      label="화면을 불러오는 중이에요."
    />
  );
}
```

즉 성능 개선만 적용한 것이 아니라:

```text
Initial Bundle 감소
      ↓
Lazy Route Loading Boundary 발생
      ↓
Root Loading Fallback 추가
```

까지 함께 처리했습니다.

---

## 결과

### Main JavaScript Chunk

|          |      Before |     After |    Change |
| -------- | ----------: | --------: | --------: |
| Minified | 1,459.20 kB | 660.41 kB |    -54.7% |
| Gzip     |   455.90 kB | 209.82 kB | 약 -54.0% |

Minified 기준:

```text
1,459.20 kB
      ↓
660.41 kB

798.79 kB 감소
약 54.7% 감소
```

Gzip 기준:

```text
455.90 kB
     ↓
209.82 kB

246.08 kB 감소
약 54.0% 감소
```

---

## MSW Development Chunk

변경 전 Production Output에는 다음 Chunk가 존재했습니다.

```text
browser-D782mKHX.js

538.11 kB
gzip: 186.04 kB
```

변경 후 Production Build에서는
해당 `browser` Chunk가 생성되지 않았습니다.

`browser` Chunk는 Main Application Chunk와 별도의 Output이므로
Main Chunk 감소량과 합산해 Bundle 감소율을 계산하지 않았습니다.

---

## Route Chunk 분리 결과

변경 이후 상세 화면들은 별도의 Route Chunk로 생성됩니다.

Production Build에서 확인된 예시는 다음과 같습니다.

```text
VolunteerSearchPage       8.16 kB
ProfileEditPage          12.54 kB
NotificationPage         15.66 kB
TeamDetailPage           20.28 kB
MyActivitiesPage         22.29 kB
MyBadgesPage             25.94 kB
TeamPostDetailPage       32.98 kB
VolunteerDetailPage      42.59 kB
```

즉 기존에 Main Application Graph에 연결되어 있던
상세 Page Dependency가 실제 Route 접근 시점으로 분리되었습니다.

---

## 검증

변경 이후 다음을 확인했습니다.

```text
Production Build
Route Chunk Output
Unit Test
E2E Test
```

주요 검증 내용은 다음과 같습니다.

- Production Build 정상 완료
- 상세 Page별 JavaScript Chunk 생성 확인
- MSW `browser` Chunk의 Production Output 제거 확인
- 기존 주요 Navigation 정상 동작 확인
- Lazy Route 직접 진입 시 공통 Loading State 확인
- Playwright E2E 주요 사용자 흐름 통과

---

## 남은 과제

이번 작업으로 Main JavaScript Chunk를 크게 줄였지만,
현재 Main Chunk는 약 `660 kB`로
Vite의 기본 `500 kB` Warning 기준을 여전히 초과합니다.

추가 최적화가 필요하다면 다음 단계에서는
Main Chunk 내부 Dependency를 분석해
공통 Vendor 또는 초기 Route Dependency를 추가로 분리할 수 있습니다.

---

## 배운 점

Bundle 최적화는 단순히 `lazy()`나 `dynamic import()`를 많이 추가하는 작업이 아니라,
사용자가 실제로 어떤 순서로 화면에 접근하는지를 기준으로
**Loading Boundary를 설계하는 작업**이라는 점을 확인했습니다.

또한 다음 두 개념이 다르다는 점도 확인했습니다.

```text
Production에서 실행되지 않는 코드
```

```text
Production Build에 포함되지 않는 코드
```

마지막으로 Code Splitting에는 다음과 같은 Trade-off가 존재합니다.

```text
Initial JavaScript 비용 감소
        ↕
후속 Route Loading 비용 증가
```

따라서 Bundle Size만 측정하는 것이 아니라
Lazy Route 진입 시 Loading UX까지 함께 검증해야 한다고 판단했습니다.

---

## 관련 변경

- PR #133 — Route-level Lazy Loading 및 MSW Development-only Bundle 분리
- PR #134 — Lazy Route Root HydrateFallback 추가

# 인증 Bootstrap과 Session Lifecycle 분리

## 문제 상황

Gather는 Access Token을 클라이언트 메모리에서 관리하고,
Refresh Token은 Cookie를 통해 사용하는 인증 구조를 사용합니다.

브라우저를 새로고침하면 메모리에 저장된 Access Token이 사라지기 때문에,
앱 최초 진입 시 기존 로그인 세션이 존재하는지를 확인하는 초기화 과정이 필요했습니다.

초기 구현에서는 이 Bootstrap 과정에서도
Access Token 재발급에 사용하는 `/api/v1/auth/reissue`를 호출하고 있었습니다.

이 때문에 Refresh Token이 존재하지 않는 정상적인 비로그인 사용자도
서비스에 처음 진입할 때 다음 흐름을 거치게 되었습니다.

```text
App Bootstrap
      ↓
POST /api/v1/auth/reissue
      ↓
Refresh Token 없음
      ↓
401 Unauthorized
```

단순히 개발자 도구의 Console이나 Network 탭에
`401 Unauthorized`가 표시되는 것만이 문제는 아니었습니다.

당시 초기 인증 복원 실패는 실제 로그인 세션이 무효화된 상황과 동일하게
`clearAuthSession()`을 통해 처리되고 있었고,
이 과정에서 인증 상태뿐 아니라 TanStack Query Cache까지 함께 초기화되었습니다.

따라서 정상적인 비회원 진입에서도 다음과 같은 흐름이 발생할 수 있었습니다.

```text
비회원 앱 진입
      ↓
reissue 실패
      ↓
clearAuthSession()
      ↓
Auth State Clear
      +
Query Cache Clear
```

이미 조회된 공개 데이터의 Cache까지 제거되기 때문에
불필요한 API 재요청이나 Loading State 재진입으로 이어질 수 있는 구조였습니다.

즉 이번 문제의 핵심은 단순한 `401` 로그가 아니라,

> 앱 최초 세션 판별과 실제 로그인 세션 무효화가 동일한 Lifecycle로 처리되고 있다는 점

이었습니다.

---

## 원인 분석

인증 흐름을 다시 분석하면서
기존 구조에 서로 다른 의미를 가진 세 가지 책임이 섞여 있음을 확인했습니다.

### 1. App Bootstrap

애플리케이션이 처음 실행될 때
현재 브라우저가 기존 로그인 세션을 가지고 있는지 확인하는 단계입니다.

```text
"현재 로그인된 사용자인가?"
```

이 단계에서는 사용자가 비회원인 것도 정상적인 결과입니다.

따라서 세션이 존재하지 않는다고 해서
이를 인증 오류나 세션 무효화로 취급할 필요가 없습니다.

### 2. Runtime Token Refresh

이미 로그인된 사용자가 API를 사용하는 도중
Access Token이 만료됐을 때 새로운 Access Token을 발급받는 단계입니다.

```text
"기존 로그인 세션을 유지하면서
 Access Token만 새로 발급할 수 있는가?"
```

이 상황에서는 Refresh Token을 이용한 `/auth/reissue`가 필요합니다.

### 3. Session Invalidation

Refresh Token이 만료되거나 폐기되는 등
서버가 더 이상 해당 로그인 세션을 인정하지 않는 상태입니다.

```text
"현재 사용자 세션을 종료해야 하는가?"
```

이 경우에만 인증 상태와 사용자에게 귀속된 Server State Cache를
함께 제거하는 것이 적절합니다.

기존 구조는 App Bootstrap과 Runtime Token Refresh를 동일한 흐름으로 처리하면서
이 세 상태의 의미를 명확히 구분하지 못하고 있었습니다.

---

## 해결 1. Bootstrap 전용 Session Restore 분리

앱 최초 진입에서는 더 이상 `/auth/reissue`를 호출하지 않고,
Bootstrap 전용 `/api/v1/auth/session/restore`를 사용하도록 변경했습니다.

```text
App Bootstrap
      ↓
POST /api/v1/auth/session/restore
      ↓
authenticated?
 ├─ true  → Access Token 저장
 └─ false → Anonymous 상태
```

Session Restore는 Access Token을 전제로 하지 않는 요청이므로
인증 헤더를 생략하고 Refresh Token Cookie만 서버에 전달합니다.

```ts
return fetchClient("/api/v1/auth/session/restore", {
  method: "POST",
  skipAuth: true,
  withCredentials: true,
});
```

`skipAuth: true`를 사용해
Bootstrap 요청 자체가 일반 Access Token Refresh 흐름에 다시 진입하지 않도록 했습니다.

세션이 존재하지 않는 것은 오류가 아니라
정상적인 Anonymous 상태로 처리합니다.

---

## 해결 2. Session Restore 요청 Single-flight 처리

React 애플리케이션에서는 여러 인증 의존 로직이
비슷한 시점에 실행될 수 있습니다.

동일한 Bootstrap 요청이 중복 수행되지 않도록
진행 중인 Promise를 공유하는 `restoreSessionOnce()`를 사용했습니다.

개념적으로 다음과 같이 동작합니다.

```ts
let restorePromise = null;

export function restoreSessionOnce() {
  if (!restorePromise) {
    restorePromise = restoreSession().finally(() => {
      restorePromise = null;
    });
  }

  return restorePromise;
}
```

따라서 여러 곳에서 세션 복원을 요구하더라도
진행 중인 요청이 있다면 동일한 Promise를 공유합니다.

```text
Caller A ─┐
Caller B ─┼─→ restorePromise → Session Restore 1회
Caller C ─┘
```

---

## 해결 3. AuthProvider는 Bootstrap 책임만 담당

`AuthProvider`에서는 앱이 처음 실행될 때 Session Restore를 수행하고,
그 결과에 따라서만 인증 상태를 초기화합니다.

세션이 존재하는 경우:

```text
restoreSessionOnce()
        ↓
authenticated = true
        ↓
Access Token 저장
        ↓
isAuthenticated = true
```

세션이 존재하지 않는 경우:

```text
authenticated = false
        ↓
clearAuth()
        ↓
Anonymous
```

여기서 중요한 점은
단순히 로그인 세션이 존재하지 않는다고 해서 `clearAuthSession()`을 호출하지 않는 것입니다.

`clearAuth()`는 Zustand의 인증 상태만 정리합니다.

```text
clearAuth()

accessToken = null
isAuthenticated = false
```

따라서 공개 페이지에서 이미 조회한 TanStack Query Cache는 유지됩니다.

---

## 해결 4. 인증 초기화 완료 여부를 별도 상태로 관리

앱 최초 실행 직후에는 아직 사용자가 로그인 상태인지 알 수 없습니다.

이 시점에 단순히 다음 값만 보고 판단하면:

```text
isAuthenticated === false
```

실제로 유효한 세션을 가진 사용자도
Session Restore가 완료되기 전에 일시적으로 비회원으로 판단될 수 있습니다.

따라서 다음과 같이 상태를 구분합니다.

```text
authInitialized = false
→ 아직 인증 상태 확인 중

authInitialized = true
isAuthenticated = false
→ Anonymous

authInitialized = true
isAuthenticated = true
→ Authenticated
```

Protected Route에서는 초기화 완료 전까지 바로 Redirect하지 않고
Loading State를 표시합니다.

```text
authInitialized = false
        ↓
LoadingState

authInitialized = true
        ↓
isAuthenticated 확인
```

이를 통해 Session Restore가 완료되기 전에
잘못된 인증 판단을 수행하지 않도록 했습니다.

---

## 해결 5. Runtime Refresh는 `EXPIRED_TOKEN`에만 수행

App Bootstrap과 달리,
이미 로그인한 사용자의 Access Token이 만료된 경우에는
기존 Token Refresh 흐름을 사용합니다.

```text
Protected API Request
        ↓
401 EXPIRED_TOKEN
        ↓
refreshSessionOnce()
        ↓
POST /auth/reissue
        ↓
New Access Token
        ↓
Original Request 1회 Retry
```

모든 `401`에서 Refresh를 수행하는 것은 아닙니다.

현재 `fetchClient`는 다음 조건을 만족할 때만 Token Refresh를 시도합니다.

```text
status === 401
error.code === EXPIRED_TOKEN
skipAuth !== true
```

반면 다음과 같이
세션 자체가 더 이상 유효하지 않음을 의미하는 응답은:

```text
UNAUTHORIZED
INVALID_TOKEN
REVOKED_TOKEN
```

새로운 Token Refresh를 반복하지 않고
Session Invalidation 대상으로 처리합니다.

---

## 해결 6. 동시 Token 만료 시 Reissue 요청 중복 방지

한 화면에서 여러 Query가 동시에 실행되는 경우,
Access Token이 만료되면 여러 API 요청이 거의 동시에
`EXPIRED_TOKEN`을 반환할 수 있습니다.

각 요청이 독립적으로 `/auth/reissue`를 호출한다면:

```text
API A → EXPIRED_TOKEN → reissue
API B → EXPIRED_TOKEN → reissue
API C → EXPIRED_TOKEN → reissue
```

처럼 동일한 Refresh Token을 사용한 요청이 동시에 발생할 수 있습니다.

Refresh Token Rotation을 사용하는 환경에서는
이러한 중복 요청이 경쟁 상태를 만들 가능성도 있습니다.

이를 방지하기 위해
진행 중인 Refresh Promise를 공유하도록 구성했습니다.

```text
API A ─┐
API B ─┼─→ shared refreshPromise → reissue 1회
API C ─┘
```

여러 API가 동시에 만료되더라도
실제 Token Refresh 요청은 한 번만 수행됩니다.

---

## 해결 7. 원 요청은 한 번만 재시도

Token Refresh가 성공하면
기존 요청을 새로운 Access Token으로 한 번 재실행합니다.

```text
Original Request
      ↓
EXPIRED_TOKEN
      ↓
Refresh
      ↓
Retry 1회
```

재시도 요청이 다시 `401`을 반환한다고 해서
다시 Refresh 흐름을 반복하지 않습니다.

```text
Original Request
      ↓
Refresh
      ↓
Retry
      ↓
401
      ↓
Error 전달 / 필요 시 Session Clear
```

이를 통해 무한 Token Refresh Loop가 발생하지 않도록 했습니다.

---

## 해결 8. Auth Clear와 Session Clear 분리

이번 문제에서 가장 중요한 Lifecycle 구분 중 하나였습니다.

### Anonymous 판별

로그인 세션이 존재하지 않는 정상적인 상태입니다.

```text
clearAuth()

Zustand Auth State만 초기화
```

### 실제 Session Invalidation

로그인했던 사용자의 세션이 더 이상 유효하지 않은 상태입니다.

```text
clearAuthSession()

Auth State Clear
       +
TanStack Query Cache Clear
```

로그인 사용자에게 귀속된 Server State가 남아 있는 상태에서
다른 사용자가 로그인하면 이전 사용자 데이터가 남을 수 있기 때문에,
실제 세션 종료 시에는 Query Cache까지 함께 정리합니다.

반대로 정상적인 Anonymous Bootstrap에서는
공개 Server State Cache까지 제거할 이유가 없습니다.

---

## 최종 인증 Lifecycle

```text
                    ┌────────────────────┐
                    │     App Start      │
                    └─────────┬──────────┘
                              ↓
                    restoreSessionOnce()
                              ↓
                   /auth/session/restore
                              ↓
                 ┌────────────┴────────────┐
                 ↓                         ↓
          authenticated=true       authenticated=false
                 ↓                         ↓
         Access Token 저장              clearAuth()
                 │                         │
                 └────────────┬────────────┘
                              ↓
                  authInitialized = true
                              ↓
                         App Render
```

Runtime API에서는 별도의 흐름을 사용합니다.

```text
API Request
    ↓
401 EXPIRED_TOKEN
    ↓
refreshSessionOnce()
    ↓
/auth/reissue
    ↓
New Access Token
    ↓
Original Request 1회 Retry
    ↓
┌───────────────┴───────────────┐
↓                               ↓
Success                  Terminal 401
↓                               ↓
Response                 clearAuthSession()
                                ↓
                       Auth + Query Cache Clear
```

---

## 검증

인증 구조 변경 이후
구현 세부사항이 아니라 실제 인증 Contract를 기준으로 회귀 테스트를 작성했습니다.

| Scenario                        | Expected                              |
| ------------------------------- | ------------------------------------- |
| 비로그인 앱 최초 진입           | Session Restore 1회, Reissue 0회      |
| 유효한 기존 로그인 세션         | Access Token 복원                     |
| Session Restore 서버 오류       | Reissue 없이 인증 초기화 완료         |
| Kakao OAuth Callback            | Bootstrap Session Restore 생략        |
| Access Token 만료               | Reissue 후 원 요청 1회 Retry          |
| 여러 API 동시 만료              | Reissue 1회                           |
| `skipAuth` 요청의 EXPIRED_TOKEN | Reissue하지 않음                      |
| Reissue 실패                    | Session Clear 후 원 요청 재실행 안 함 |
| Retry 요청이 다시 401           | 추가 Refresh 수행 안 함               |
| UNAUTHORIZED                    | Session Clear                         |
| INVALID_TOKEN                   | Session Clear                         |
| REVOKED_TOKEN                   | Session Clear                         |

---

## 결과

이번 수정은 Console에 표시되는 `401`을 숨기는 방식으로 해결하지 않았습니다.

초기 문제를 추적하면서
인증 Lifecycle 자체에 서로 다른 책임이 섞여 있음을 확인했고,
이를 다음과 같이 분리했습니다.

```text
App Bootstrap
→ Session Restore

Access Token Expiration
→ Token Refresh

Actual Session Invalidation
→ Auth State + User Query Cache Clear
```

그 결과 다음을 개선할 수 있었습니다.

- 정상적인 비회원 진입에서 불필요한 `/auth/reissue` 요청 제거
- 비회원 Bootstrap 실패로 공개 Query Cache가 제거되는 문제 수정
- Session Restore와 Runtime Refresh 책임 분리
- 동시 Access Token 만료 시 Reissue 중복 요청 방지
- Refresh 성공 후 원 요청의 무한 재시도 방지
- 실제 Session Invalidation에서만 사용자 Query Cache 정리
- 인증 초기화 이전의 성급한 Protected Route 판단 방지

---

## 배운 점

인증에서는 모든 `401 Unauthorized`를 동일한 상태로 취급하면 안 된다는 점을 확인했습니다.

특히 다음 네 상태는 서로 다른 의미를 가집니다.

```text
아직 로그인 여부를 확인하지 않은 상태
정상적인 Anonymous 상태
Access Token만 만료된 상태
Session 자체가 무효화된 상태
```

HTTP Status만 기준으로 처리하기보다
각 상태가 애플리케이션 Lifecycle에서 어떤 의미를 가지는지
먼저 정의하는 것이 중요했습니다.

또한 인증 상태와 TanStack Query Cache는 서로 독립적으로 보이지만,
사용자 변경 시 Server State의 소유권이 달라지기 때문에
실제 Session 종료에서는 두 Lifecycle을 함께 고려해야 한다는 점도 확인했습니다.

---

## 관련 변경

- PR #114 — 인증 복원 실패 시 공개 Query Cache 유지
- PR #118 — 인증 Bootstrap Session Restore 구조 분리
- PR #133 — Refresh 이후 Terminal 401 Session Clear 보완

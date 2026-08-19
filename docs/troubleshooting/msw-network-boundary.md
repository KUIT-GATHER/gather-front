# MSW 환경의 실제 Backend 요청 유출 방지

## 문제 상황

Gather는 Backend 구현 상태와 독립적으로
프론트엔드 UI와 사용자 흐름을 개발·테스트할 수 있도록
개발 환경에서 MSW(Mock Service Worker)를 사용합니다.

회원가입의 전화번호 인증 흐름을 MSW 환경에서 QA하던 중,
Mock으로 처리되어야 할 인증 `confirm` 요청이
실제 Backend로 전달될 수 있는 문제를 확인했습니다.

문제가 발생한 흐름은 다음과 같았습니다.

```text
전화번호 인증 시작
       ↓
MSW Start Handler
       ↓
SMS App 실행
       ↓
Browser → 외부 SMS App 전환
       ↓
Browser의 MSW Client 흐름 중단 가능
       ↓
Confirm Polling
       ↓
실제 Backend 요청 유출
```

Mock 환경에서 테스트하고 있다고 판단했음에도
실제 Backend에 요청이 전달될 수 있다는 점은
단순한 테스트 실패보다 더 큰 문제였습니다.

Mock 환경과 실제 Backend 상태가 섞이면
테스트 결과가 실행 환경에 따라 달라질 수 있고,
개발자가 의도하지 않은 실제 API 호출이 발생할 수 있기 때문입니다.

---

## 원인 분석

문제는 하나의 MSW Handler가 빠진 정도가 아니었습니다.

두 가지 구조적인 문제가 함께 존재했습니다.

---

## 원인 1. MSW 환경에서도 실제 SMS App을 실행

실제 전화번호 인증에서는
사용자가 SMS Application으로 이동해 인증 메시지를 보내는 과정이 필요합니다.

하지만 MSW 환경에서는 Backend 응답과 인증 상태 자체를 Mock으로 처리합니다.

따라서 다음 단계가 Mock Test의 핵심 검증 대상입니다.

```text
전화번호 인증 요청
      ↓
Polling
      ↓
VERIFIED
      ↓
UI 상태 변경
```

반면:

```text
실제 OS SMS Application 실행
```

까지 Mock 환경에서 그대로 수행할 필요는 없습니다.

기존에는 Production과 동일한 흐름으로 SMS App을 실행했고,
외부 App 전환 과정이 Browser의 MSW Client Lifecycle에 영향을 줄 수 있었습니다.

---

## 원인 2. Unhandled Request가 전체 Bypass

기존 MSW Worker는 등록되지 않은 요청에 대해
다음 정책을 사용했습니다.

```ts
worker.start({
  onUnhandledRequest: "bypass",
});
```

`bypass`는 MSW Handler와 일치하지 않는 요청을
실제 Network로 전달하도록 허용합니다.

Kakao API나 외부 Storage처럼
실제 요청을 허용해야 하는 서비스가 존재하기 때문에
bypass 자체가 잘못된 기능은 아닙니다.

문제는 다음 두 요청을 동일하게 취급하고 있었다는 점입니다.

```text
Gather Internal API
/api/*
```

```text
External Service
Kakao / Storage / ...
```

Gather 자체 API의 Handler가 빠진 경우에도
조용히 실제 Backend로 Fallback할 수 있는 구조였습니다.

---

## 해결 1. MSW 환경에서는 SMS App 실행 생략

전화번호 인증 방식과
실제 SMS Application 실행 여부를 분리했습니다.

```ts
export function shouldLaunchSmsVerificationApp(
  usesSmsVerification: boolean,
  isMswDevelopment: boolean,
) {
  return usesSmsVerification && !isMswDevelopment;
}
```

회원가입 화면에서는 현재 실행 환경을 기준으로 판단합니다.

```ts
const shouldLaunchSmsApp = shouldLaunchSmsVerificationApp(
  usesSmsVerification,
  env.IS_DEV && env.ENABLE_MSW,
);
```

실제 환경에서는 기존처럼 SMS App을 실행합니다.

```text
Production
     ↓
SMS Verification
     ↓
SMS App Launch
```

MSW 개발 환경에서는 다음과 같이 처리합니다.

```text
Development + MSW
        ↓
SMS Verification
        ↓
SMS App Launch 생략
        ↓
Mock Polling 계속 수행
```

Mock에서 필요한 인증 상태 전이와 UI 검증은 그대로 유지하면서,
불필요한 Native App Transition만 제거했습니다.

---

## 해결 2. Gather API Scope 명시

모든 Unhandled Request를 무조건 차단하면
Kakao 등 실제 외부 Service 요청까지 MSW가 막을 수 있습니다.

따라서 먼저 다음 질문에 대한 기준을 정의했습니다.

> 어떤 요청까지 Gather Mock System이 책임지는가?

Gather Internal API는 다음 두 조건으로 판별합니다.

```text
request.origin === API_BASE_URL.origin

AND

request.pathname startsWith "/api/"
```

개념적으로 다음과 같습니다.

```ts
export function isGatherApiRequestUrl(requestUrl: URL) {
  return (
    requestUrl.origin === getGatherApiOrigin() &&
    requestUrl.pathname.startsWith("/api/")
  );
}
```

이를 통해 다음 두 종류의 요청을 구분했습니다.

```text
Gather API
```

```text
External Network Request
```

---

## 해결 3. Gather Internal API는 Fail-closed

MSW가 활성화된 개발 환경에서
등록되지 않은 Gather API 요청이 발생하면
실제 Backend로 조용히 전달되지 않도록 변경했습니다.

최종 정책은 다음과 같습니다.

```text
Gather API Request
       ↓
Matching MSW Handler?
   ┌───────┴────────┐
   ↓                ↓
  Yes               No
   ↓                ↓
Mock Response       501
                   +
             Explicit Error
```

현재 Handler 목록 마지막에는
Gather API를 대상으로 하는 Catch-all Handler가 존재합니다.

```ts
http.all(getGatherApiCatchAllPattern(), ({ request }) => {
  console.error(
    `[MSW] Unhandled API request: ${request.method} ${request.url}`,
  );

  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "MSW_HANDLER_NOT_FOUND",
        message: "등록되지 않은 MSW API 요청입니다.",
      },
    },
    { status: 501 },
  );
});
```

따라서 새로운 Gather API를 프론트에서 호출했는데
MSW Handler를 추가하지 않았다면:

```text
Real Backend Request
```

로 Fallback하지 않고:

```text
501 MSW_HANDLER_NOT_FOUND
```

로 즉시 문제를 확인할 수 있습니다.

---

## 해결 4. Unhandled Request Policy도 API Scope 기준으로 분리

Worker 수준에서도 기존의 전역 `"bypass"` 설정을 제거했습니다.

Gather Internal API에 대해서만 Error Strategy를 적용합니다.

```ts
export const handleUnhandledRequest = (request, print) => {
  if (isGatherApiRequestUrl(new URL(request.url))) {
    print.error();
  }
};
```

결과적으로 Network Policy는 다음과 같이 분리됩니다.

```text
Gather Internal API
→ Fail-closed

External Request
→ Bypass
```

---

## 최종 Network Boundary

```text
                        Browser Request
                               │
                               ↓
                          MSW Worker
                               │
                  ┌────────────┴────────────┐
                  ↓                         ↓
             Gather API                External Request
          API_BASE_URL + /api/*      Kakao / Storage / ...
                  │                         │
                  ↓                         ↓
          Matching Handler?               Bypass
             │          │
            Yes         No
             │          │
             ↓          ↓
       Mock Response    501
                       +
              MSW_HANDLER_NOT_FOUND
```

전화번호 인증 MSW 환경에서는
이 Network Boundary에 더해
SMS App Transition 자체도 생략합니다.

---

## 검증

Network Boundary가 다시 느슨해지는 것을 막기 위해
API Scope 자체를 테스트했습니다.

| Scenario                       | Expected                    |
| ------------------------------ | --------------------------- |
| API Base URL + `/api/*`        | Gather API                  |
| 같은 Origin의 `/api` 이외 Path | Gather API 아님             |
| Kakao 등 다른 Origin           | Gather API 아님             |
| Unhandled Gather API           | Error Strategy              |
| External Request               | Bypass                      |
| 등록되지 않은 Gather API       | 501 `MSW_HANDLER_NOT_FOUND` |

실제 테스트에서는 등록되지 않은 API 요청을 발생시켜:

```text
GET /api/v1/unregistered-msw-endpoint
```

가 실제 Backend로 전달되지 않고:

```text
501
MSW_HANDLER_NOT_FOUND
```

로 종료되는 것을 검증합니다.

전화번호 인증 Mock Flow에 대해서도 다음을 함께 확인합니다.

```text
Start Verification
      ↓
Dynamic Confirm Route Matching
      ↓
VERIFIED
```

그리고 필요한 테스트에서는 Handler Override를 통해:

```text
PENDING
```

상태도 시뮬레이션할 수 있도록 유지했습니다.

---

## 결과

이번 수정으로 MSW 환경에서 Gather 내부 API가
의도치 않게 실제 Backend로 전달될 가능성을 줄였습니다.

특히 직접적인 문제를 발생시켰던
SMS App Transition을 MSW 환경에서 제거하여
전화번호 인증 Mock Flow가 Browser 내부에서 계속 유지되도록 했습니다.

또한 특정 전화번호 인증 API만 수정하는 데서 끝내지 않고,
Gather Internal API 전체에 대한 Network Boundary를 정의했습니다.

따라서 이후 새로운 API를 추가하면서
MSW Handler를 누락하더라도:

```text
"어쩌다 실제 Backend가 응답해서 테스트가 통과하는 상황"
```

보다:

```text
"Handler가 없으므로 즉시 501로 실패하는 상황"
```

을 만들 수 있게 되었습니다.

이는 개발 및 테스트 환경의 재현성과 독립성을 높이는 방향의 수정이었습니다.

---

## 배운 점

Mock 환경의 역할은 단순히
"가짜 API Response를 반환하는 것"만이 아니라는 점을 확인했습니다.

테스트 환경에서도 다음 질문을 명확히 정의해야 합니다.

```text
어떤 요청을 반드시 Mock해야 하는가?

어떤 요청은 실제 Network를 허용하는가?

Mock Handler가 누락됐을 때
조용히 실제 서버로 Fallback할 것인가,
명시적으로 실패할 것인가?
```

특히 편의를 위해 모든 요청을 `bypass`하면
Mock 환경이 실제 Backend 상태에 의존할 수 있고,
테스트의 재현성과 독립성을 잃을 가능성이 있습니다.

따라서 Internal API와 External Service 사이의
Network Boundary를 명확하게 정의하는 것이 중요했습니다.

---

## 관련 변경

- PR #119 — 이메일 인증 Proof 연동 및 MSW 인증 요청 안정화

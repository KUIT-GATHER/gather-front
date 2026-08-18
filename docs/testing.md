# Testing Strategy

## 1. 목적

Gather 프론트엔드는 모든 동작을 모든 테스트 계층에서 반복해서 검증하지 않습니다.

테스트 대상의 성격에 따라 가장 적절한 계층을 선택합니다.

현재 사용하는 테스트 도구는 다음과 같습니다.

```text
Vitest / React Testing Library
Storybook Browser Test
Playwright E2E
MSW
```

## 2. 기본 원칙

테스트는 구현 세부사항보다 사용자가 관찰할 수 있는 동작과 중요한 비즈니스 규칙을 검증합니다.

다음 항목을 우선 테스트합니다.

- 쉽게 깨질 수 있는 핵심 로직
- validation
- 인증과 세션 처리
- 사용자 action 이후 상태 변화
- 주요 routing 흐름
- API 성공 및 실패에 따른 UI
- 과거에 실제 버그가 발생했던 동작

단순 markup이나 라이브러리 자체 동작을 다시 검증하기 위한 테스트는 최소화합니다.

커버리지 숫자를 높이기 위한 테스트를 작성하지 않습니다.

## 3. Vitest / React Testing Library

Vitest와 RTL은 빠르게 실행할 수 있는 로직 및 컴포넌트 동작 검증을 담당합니다.

주요 대상:

- pure function
- mapper
- formatter
- validation schema
- custom hook
- 상태 변화
- callback contract
- 조건부 렌더링
- form interaction
- API 결과에 따른 component state

예:

```text
회원가입 schema validation
검색 parameter 변환
mutation callback
필터 상태 변경
ErrorState 렌더링
```

브라우저 전체 환경이 필요하지 않은 동작은 우선 Vitest/RTL에서 검증합니다.

## 4. Storybook Browser Test

Storybook Browser Test는 실제 브라우저 렌더링 특성이 중요한 컴포넌트를 검증합니다.

주요 대상:

- Dialog
- Dropdown
- Bottom Sheet
- Calendar
- Portal 기반 UI
- focus interaction
- keyboard interaction
- accessibility
- 브라우저에서만 확인 가능한 렌더링 동작

Storybook에 이미 존재하는 모든 Story에 `play` 함수를 추가할 필요는 없습니다.

단순한 정적 상태는 Story 자체로 문서화하고 interaction test가 의미 있는 경우에만 `play`를 작성합니다.

RTL에서 동일한 action과 assertion을 충분히 검증하고 있다면 Storybook에서 같은 테스트를 그대로 반복하지 않습니다.

## 5. Playwright E2E

Playwright는 여러 페이지와 시스템이 연결되는 실제 사용자 흐름을 검증합니다.

주요 대상:

- routing
- protected route
- authentication
- 로그인 후 redirect
- navigation
- 주요 사용자 여정
- 여러 feature가 연결되는 흐름

예:

```text
비로그인 사용자의 보호 페이지 접근
로그인 후 홈 이동
봉사 공고 상세 진입
모임 화면 navigation
알림 페이지 접근
```

작은 컴포넌트 내부 동작까지 Playwright에서 검증하지 않습니다.

## 6. MSW

MSW는 테스트와 Storybook에서 API 경계를 재현합니다.

UI에서 mock 데이터를 직접 사용하는 대신 실제 API 호출과 같은 흐름을 유지합니다.

테스트에서 필요한 응답만 handler로 정의합니다.

주요 상태:

```text
success
empty
client error
server error
loading이 필요한 지연 응답
```

실제 백엔드 서버에 의존하는 테스트는 기본 CI 테스트로 사용하지 않습니다.

## 7. 테스트 계층 선택

대략 다음 기준으로 선택합니다.

```text
순수 계산이나 validation
→ Vitest

컴포넌트 내부 사용자 interaction
→ RTL

실제 브라우저 특성이 중요한 UI
→ Storybook Browser Test

페이지 이동이나 인증을 포함한 사용자 흐름
→ Playwright
```

하나의 동작을 여러 계층에서 테스트해야 하는 경우에는 각각 다른 실패를 잡을 수 있는 이유가 있어야 합니다.

## 8. 테스트 작성 기준

테스트 이름은 구현 방식보다 기대 동작을 설명합니다.

좋은 예:

```text
인증되지 않은 사용자는 마이페이지 접근 시 로그인 화면으로 이동한다
답변을 변경하면 이전 선택 대신 새로운 답변을 사용한다
API 요청 실패 시 오류 상태를 표시한다
```

피하는 예:

```text
useEffect가 실행된다
setState가 호출된다
컴포넌트가 렌더링된다
```

가능하면 사용자가 실제로 접근하는 방식으로 요소를 찾습니다.

우선순위 예:

```text
role
label
text
test id
```

`data-testid`는 semantic query로 안정적으로 찾기 어려운 경우에만 사용합니다.

## 9. Mock 기준

테스트 대상 밖의 시스템만 mock합니다.

React Router, TanStack Query와 같은 핵심 라이브러리 동작을 과도하게 mock하지 않습니다.

API 응답은 가능한 한 MSW를 사용합니다.

테스트가 내부 구현에 강하게 결합되지 않도록 불필요한 function mock을 줄입니다.

## 10. 회귀 테스트

실제 버그를 수정할 때 재발 가능성이 높고 자동화 가능한 문제라면 regression test 추가를 우선 검토합니다.

모든 버그에 반드시 테스트를 추가할 필요는 없습니다.

다음과 같은 버그는 테스트 가치가 높습니다.

- 인증 상태
- 잘못된 query cache
- validation
- route guard
- 필터 parameter 변환
- mutation 이후 invalidate 누락
- 이전에 반복해서 발생한 사용자 흐름 오류

## 11. Coverage

Coverage는 테스트 품질을 판단하는 단일 목표로 사용하지 않습니다.

Coverage 수치는 테스트되지 않은 영역을 찾는 참고 자료로 사용합니다.

핵심 비즈니스 로직과 장애 영향이 큰 흐름을 우선 테스트합니다.

단순 UI markup이나 의미 없는 wrapper까지 테스트해 전체 coverage 수치를 맞추는 방식은 사용하지 않습니다.

## 12. 실행 명령어

Unit / RTL:

```bash
npm run test:run
```

Coverage:

```bash
npm run test:coverage
```

Storybook Browser Test:

```bash
npm run test:storybook
```

Playwright:

```bash
npm run test:e2e
```

전체 기본 검증:

```bash
npm run verify
```

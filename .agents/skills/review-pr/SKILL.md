---
name: review-pr
description: Review Gather frontend pull requests and branch diffs for regressions, architecture risks, missing tests, unnecessary changes, and merge readiness. Use when reviewing a PR, branch, commit, diff, or deciding whether a change is safe to merge.
---

# Review PR

Gather 프론트엔드의 변경 사항을 검토하고 merge 가능 여부를 판단합니다.

리뷰 요청에서는 코드를 수정하거나 commit/push하지 않습니다.
수정이 명시적으로 요청된 경우에만 별도 작업으로 진행합니다.

## 확인 순서

1. PR, branch, commit 또는 working tree 중 실제 review scope를 확인하고 변경 범위를 파악합니다.

2. diff만 보지 않고 변경 파일과 직접 연결된 코드, 호출부, 상태 흐름을 필요한 범위에서 확인합니다.

3. repository instructions를 따르고 변경 범위와 관련된 문서가 있다면 확인합니다.

   - 구조와 의존성: `docs/architecture.md`
   - 테스트 기준: `docs/testing.md`
   - 협업 및 PR 규칙: `CONTRIBUTING.md`

4. 변경 내용에 따라 다음 항목을 검토합니다.

   - 요구사항 누락
   - 기존 기능 회귀 가능성
   - 상태 및 데이터 흐름
   - API contract 영향
   - TanStack Query cache와 invalidation
   - 인증 및 라우팅 영향
   - 공용 UI 및 기존 사용처 영향
   - 반응형 및 접근성 영향
   - 불필요한 의존성 또는 구조 변경
   - 테스트 누락
   - 문서 또는 설정 변경 필요 여부

5. 단순한 스타일 취향보다 실제 버그, 회귀 가능성, 유지보수 위험을 우선합니다.

6. 변경으로 인해 새로 발생한 문제와 기존에 존재하던 문제를 구분합니다.

7. 실제로 확인된 문제와 잠재적인 위험을 구분합니다.
   확인하지 못한 사항은 사실처럼 단정하지 않습니다.

8. PR의 CI 결과가 있다면 확인합니다.
   필요한 경우 변경 범위와 관련된 검증을 추가로 실행합니다.
   최종 merge readiness 확인이 필요하면 `npm run verify`를 사용합니다.

## 결과

### 주요 발견 사항

심각도가 높은 문제부터 작성합니다.

각 finding에는 가능한 경우 다음을 포함합니다.

- 파일과 위치
- 문제 내용
- 문제가 되는 이유
- 실제 영향
- 수정 방향

문제가 없는 항목을 억지로 만들지 않습니다.

### 테스트

누락된 테스트, 추가로 확인해야 할 동작 또는 실행한 검증이 있다면 작성합니다.

특별한 문제가 없다면 짧게 정리합니다.

### Merge 판단

다음 중 하나로 판단합니다.

- **merge 가능**
- **수정 후 merge 권장**
- **merge 보류**

판단 근거를 짧게 설명합니다.

---
name: prepare-pr
description: Prepare a Gather frontend pull request from the current branch by inspecting the actual committed diff, following repository contribution rules and the pull request template, checking local and remote state, running required verification, and generating a review-ready PR title and body. Use when asked to prepare, draft, or write a pull request for the current Gather frontend branch.
---

# Prepare PR

현재 Gather 프론트엔드 브랜치의 실제 변경 사항을 확인하고 프로젝트 규칙에 맞는 Pull Request 제목과 본문을 준비합니다.

이 Skill은 실제 Pull Request를 생성하지 않습니다.

`gh pr create`, commit, push, pull, merge, rebase 또는 기존 변경 수정 등 repository나 GitHub 상태를 변경하는 작업은 수행하지 않습니다.

사용자가 준비된 내용을 확인한 뒤 실제 PR 생성을 별도로 명시적으로 요청한 경우에만 생성 작업을 진행합니다.

## 1. 현재 상태 확인

먼저 repository와 현재 branch 상태를 확인합니다.

```bash
git status --short
git branch --show-current
git remote -v
```

현재 branch가 없거나 detached HEAD 상태라면 PR 준비를 중단하고 상태를 보고합니다.

현재 branch가 `develop` 또는 `main`이면 일반 작업 PR로 준비하지 않고 상태를 보고합니다.

현재 작업과 관계없는 local 변경이 있더라도 임의로 수정하거나 되돌리지 않습니다.

## 2. 프로젝트 규칙 확인

PR을 작성하기 전에 다음 파일을 확인합니다.

- `CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- 필요한 경우 `AGENTS.md`

PR 제목과 본문은 현재 repository의 규칙과 PR template을 우선합니다.

문서에 이미 정의된 규칙을 Skill에 다시 해석하거나 임의로 변경하지 않습니다.

## 3. Base branch 결정

일반적인 작업 branch는 `develop`을 base로 사용합니다.

예:

```text
feat/*
fix/*
refactor/*
test/*
docs/*
chore/*
```

`main`을 대상으로 하는 PR은 사용자가 명시적으로 요청한 경우에만 준비합니다.

branch 이름이나 현재 작업만으로 base를 안전하게 판단할 수 없다면 임의로 결정하지 않고 상태를 보고합니다.

이후 명령에서 사용할 base branch를 변수로 관리합니다.

예:

```bash
base=develop
```

## 4. Remote 상태 갱신

remote reference를 최신 상태로 갱신합니다.

```bash
git fetch origin --prune
```

fetch는 remote reference를 확인하기 위한 용도로만 사용합니다.

명시적인 요청 없이 pull, merge 또는 rebase하지 않습니다.

## 5. Commit되지 않은 변경 확인

working tree를 확인합니다.

```bash
git status --short
```

commit되지 않은 변경은 현재 PR의 committed diff에 포함되지 않는다는 점을 구분합니다.

현재 PR에 포함되어야 할 변경이 아직 commit되지 않은 것으로 판단되면 PR 내용을 확정하지 않고 상태를 보고합니다.

현재 PR과 무관한 local 변경이라면 해당 사실을 명확히 알리고 committed diff만 기준으로 PR을 준비할 수 있습니다.

명시적인 요청 없이 local 변경을 add, commit 또는 push하지 않습니다.

## 6. 현재 branch의 Remote 상태 확인

현재 branch가 `origin`에 존재하는지 확인합니다.

```bash
branch=$(git branch --show-current)

git rev-parse --verify --quiet "refs/remotes/origin/$branch"
```

remote branch가 없다면 PR을 실제로 생성하려면 push가 필요하다는 점을 결과에 표시합니다.

remote branch가 있다면 local과 remote의 차이를 확인합니다.

```bash
git rev-list --left-right --count "origin/$branch"...HEAD
```

결과는 다음과 같이 판단합니다.

- local만 ahead: 아직 push되지 않은 commit이 있습니다.
- local만 behind: remote에 local에 없는 commit이 있습니다.
- 양쪽 모두 commit이 존재: local과 remote가 diverged 상태입니다.
- 차이가 없음: local과 remote가 같은 commit을 가리킵니다.

local과 remote가 일치하지 않더라도 내용을 분석할 수는 있지만, 실제 PR 생성 전 해결해야 할 상태로 결과에 명확히 표시합니다.

명시적인 요청 없이 push, pull, merge 또는 rebase하지 않습니다.

## 7. 기존 PR 확인

현재 head branch를 기준으로 이미 열린 PR이 있는지 확인합니다.

```bash
branch=$(git branch --show-current)

gh pr list \
  --head "$branch" \
  --state open \
  --json number,title,url,baseRefName,headRefName
```

현재 branch의 열린 PR이 이미 존재한다면 새 PR 초안을 만들 필요가 있는지 먼저 판단합니다.

기본적으로 기존 PR의 번호, 제목, base → head, URL을 알려주고 새 PR 생성용 작업은 중단합니다.

사용자가 기존 PR의 제목이나 본문 수정을 요청한 경우에는 해당 요청 범위에서만 내용을 준비합니다.

## 8. 변경 존재 여부 확인

결정된 base branch와 비교했을 때 committed 변경이 있는지 확인합니다.

```bash
git diff --quiet "origin/$base"...HEAD
```

변경이 없다면 PR에 포함할 committed 변경 사항이 없다고 보고하고 종료합니다.

## 9. 변경 범위 분석

commit message만 보지 않고 실제 committed diff를 분석합니다.

```bash
git log --oneline "origin/$base"..HEAD
git diff --stat "origin/$base"...HEAD
git diff "origin/$base"...HEAD
```

필요한 경우 변경 파일과 직접 연결된 코드도 확인합니다.

실제 diff를 기준으로 다음을 파악합니다.

- 주요 변경 기능
- 버그 수정 내용
- 사용자 동작 변화
- API 또는 데이터 흐름 변화
- 구조 또는 설정 변경
- 테스트 변경
- 문서 변경

관련 없는 기존 코드나 이번 PR에 포함되지 않은 작업은 PR 내용에 작성하지 않습니다.

commit message는 변경 의도를 이해하기 위한 보조 정보로만 사용합니다.

## 10. PR 제목 작성

`CONTRIBUTING.md`의 현재 PR 제목 규칙을 따릅니다.

기본 형식:

```text
type: 작업 내용
```

예:

```text
feat: 봉사 일정 선택 기능 추가
fix: 필터 바텀시트 레이아웃 수정
refactor: 인증 세션 처리 구조 정리
test: 회원가입 인증 테스트 보강
docs: 프론트엔드 문서 정리
```

제목은 실제 diff의 핵심 변경을 기준으로 간결하게 작성합니다.

branch 이름이나 commit message를 그대로 복사하지 않습니다.

여러 변경이 포함된 경우 가장 대표적인 변경을 중심으로 제목을 작성합니다.

실제 변경보다 범위를 넓게 표현하지 않습니다.

## 11. PR 본문 작성

`.github/PULL_REQUEST_TEMPLATE.md`를 읽고 현재 템플릿 구조를 그대로 사용합니다.

실제 diff와 검증 결과를 바탕으로 내용을 작성합니다.

다음 원칙을 따릅니다.

- 변경 내용을 과장하지 않습니다.
- 코드에서 확인되지 않은 내용을 작성하지 않습니다.
- commit 목록을 그대로 나열하지 않습니다.
- 구현 세부사항을 지나치게 길게 작성하지 않습니다.
- 리뷰어가 알아야 할 변경과 영향 위주로 작성합니다.
- 불필요하게 장황하거나 추상적인 표현을 사용하지 않습니다.
- 관련 이슈 번호를 확인할 수 없는 경우 임의로 만들지 않습니다.
- UI 변경이 없다면 화면 섹션에 불필요한 내용을 추가하지 않습니다.
- 실행하지 않은 검증을 실행한 것처럼 작성하지 않습니다.
- 추가 확인이 필요한 부분은 완료된 것처럼 표현하지 않습니다.

PR 본문은 실제 팀원이 작성한 것처럼 간결하고 구체적으로 작성합니다.

## 12. 검증

PR 내용을 확정하기 전에 기본 검증을 실행합니다.

```bash
npm run verify
```

브라우저 동작, 인증, 라우팅 또는 주요 사용자 흐름 변경이 포함되어 있고 관련 테스트가 존재한다면 필요한 테스트도 실행합니다.

예:

```bash
npm run test:storybook
npm run test:e2e
```

모든 테스트를 이유 없이 실행하지 않고 변경 범위에 맞는 검증을 선택합니다.

검증이 실패하면 실패 원인을 확인합니다.

이번 변경으로 인해 실패한 검사가 있다면 PR을 바로 올릴 수 있는 상태로 표현하지 않습니다.

기존 문제로 판단되는 실패라면 이번 변경과의 관련 여부와 확인한 근거를 명확히 보고합니다.

검증 실패를 임의로 무시하거나 테스트를 통과시키기 위해 skip 처리 또는 unrelated code 수정을 하지 않습니다.

## 13. PR 미리보기

모든 분석과 검증이 끝나면 실제로 사용할 PR 내용을 사용자에게 보여줍니다.

다음 형식으로 정리합니다.

### PR 제목

```text
<PR 제목>
```

### PR 본문

PR template 구조를 유지한 완성된 Markdown을 제공합니다.

### PR 정보

- base: `<base branch>`
- head: `<current branch>`
- remote 상태: `<동기화 여부>`
- 검증: `<실행한 검증과 결과>`
- 기존 PR: `<없음 또는 PR 정보>`

실제 Pull Request는 생성하지 않습니다.

## 14. 결과 보고

작업 완료 후 다음 내용을 간단히 알려줍니다.

- PR 제목
- base → head
- 주요 변경 내용
- 실행한 검증과 결과
- remote 상태
- PR 본문
- 실제 PR 생성 전에 필요한 작업

다음과 같은 상태가 있다면 명확하게 표시합니다.

- commit되지 않은 변경이 있음
- push되지 않은 commit이 있음
- remote branch가 없음
- local과 remote가 diverged 상태임
- 검증 실패가 있음
- 기존 PR이 이미 존재함
- PR에 포함할 변경이 없음

실제 PR 생성은 사용자가 준비된 제목과 본문을 확인한 뒤 별도로 명시적으로 요청한 경우에만 진행합니다.

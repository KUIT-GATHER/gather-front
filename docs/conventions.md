# Gather Frontend 개발 규칙

## 1. 브랜치 전략

Gather Frontend는 아래 브랜치를 사용합니다.

```txt
main
develop
feature/*
fix/*
chore/*
docs/*
refactor/*
```

### main

`main` 브랜치는 최종 배포용 브랜치입니다.

* 직접 push하지 않습니다.
* 일반 기능 작업은 `main`으로 바로 병합하지 않습니다.
* QA 또는 배포 준비가 완료된 `develop` 브랜치만 `main`으로 병합합니다.

### develop

`develop` 브랜치는 기본 개발 브랜치입니다.

* 모든 기능 작업은 `develop`에서 새 브랜치를 생성해 진행합니다.
* 기능 개발이 완료되면 `develop`을 대상으로 Pull Request를 생성합니다.
* `develop`에도 직접 push하지 않습니다.

### 작업 브랜치

작업 브랜치는 아래 형식을 사용합니다.

```bash
feature/기능명
fix/버그명
chore/설정명
docs/문서명
refactor/리팩토링명
```

예시:

```bash
feature/email-login
feature/home
feature/team-create
feature/team-search
fix/login-validation
chore/update-branch-strategy
docs/update-conventions
refactor/team-card
```

---

## 2. 작업 흐름

작업 시작 전 항상 `develop` 브랜치를 최신 상태로 맞춥니다.

```bash
git checkout develop
git pull origin develop
```

새 작업 브랜치를 생성합니다.

```bash
git checkout -b feature/작업명
```

작업 후 커밋합니다.

```bash
git add .
git commit -m "feat: 작업 내용"
```

처음 push할 때는 원격 브랜치와 연결합니다.

```bash
git push -u origin feature/작업명
```

이후 같은 브랜치에서 추가 push할 때는 아래 명령어만 사용해도 됩니다.

```bash
git push
```

GitHub에서 Pull Request를 생성합니다.

기본 PR 방향은 아래와 같습니다.

```txt
feature/작업명 → develop
fix/작업명 → develop
chore/작업명 → develop
docs/작업명 → develop
refactor/작업명 → develop
```

QA 또는 배포 시점에는 아래 방향으로 Pull Request를 생성합니다.

```txt
develop → main
```

---

## 3. 커밋 메시지 규칙

커밋 메시지는 아래 형식을 사용합니다.

```bash
타입: 작업 내용
```

예시:

```bash
feat: 이메일 로그인 화면 구현
fix: 로그인 실패 메시지 표시 오류 수정
chore: GitHub Actions CI 설정 추가
docs: 개발 규칙 문서 수정
refactor: 팀 카드 컴포넌트 구조 개선
```

### 커밋 타입

| 타입       | 의미                   |
| -------- | -------------------- |
| feat     | 새로운 기능 추가            |
| fix      | 버그 수정                |
| refactor | 기능 변화 없는 코드 구조 개선    |
| style    | CSS, UI 스타일, 포맷팅 수정  |
| chore    | 설정, 패키지, 빌드, 환경설정 작업 |
| docs     | 문서 수정                |
| test     | 테스트 코드 추가 또는 수정      |

### 커밋 메시지 작성 기준

* 한글로 작성합니다.
* 문장 끝에 마침표를 붙이지 않습니다.
* 한 커밋에는 하나의 작업만 담습니다.
* 너무 큰 단위로 커밋하지 않습니다.
* `수정`, `최종`, `작업`, `오류고침` 같은 모호한 메시지는 사용하지 않습니다.

좋은 예:

```bash
feat: 팀 생성 폼 구현
fix: 팀 검색 결과 없음 UI 표시 오류 수정
style: 로그인 페이지 반응형 스타일 수정
chore: eslint 설정 추가
docs: README 실행 방법 수정
```

나쁜 예:

```bash
수정
최종
로그인
작업함
오류고침
```

---

## 4. Pull Request 규칙

모든 작업은 Pull Request를 통해 병합합니다.

### PR 제목

PR 제목은 커밋 메시지 규칙과 동일하게 작성합니다.

예시:

```bash
feat: 이메일 로그인 화면 구현
fix: 팀 생성 validation 오류 수정
chore: 프로젝트 초기 설정 추가
docs: 개발 규칙 문서 수정
```

### PR 본문

PR에는 아래 내용을 작성합니다.

* 작업 내용
* 변경 사항
* 확인한 것
* 관련 이슈
* 스크린샷 또는 화면 녹화

화면 변경이 있는 PR은 가능하면 스크린샷 또는 화면 녹화를 첨부합니다.

### PR 대상 브랜치

일반 기능 작업은 `develop` 브랜치를 대상으로 합니다.

```txt
feature/* → develop
fix/* → develop
chore/* → develop
docs/* → develop
refactor/* → develop
```

`main` 브랜치로 직접 PR을 올리지 않습니다.

단, QA 또는 배포 시점에는 `develop`에서 `main`으로 PR을 생성합니다.

```txt
develop → main
```

---

## 5. 코드 확인 규칙

PR을 올리기 전 아래 명령어를 실행해 확인합니다.

```bash
npm run lint
npm run build
```

각 명령어의 의미는 아래와 같습니다.

```txt
npm run lint
→ 코드 규칙 검사

npm run build
→ 실제 배포 가능한 상태인지 검사
```

둘 중 하나라도 실패하면 수정 후 다시 PR을 올립니다.

---

## 6. 기능 완료 기준

기능은 아래 기준을 만족해야 완료로 봅니다.

* 로컬에서 정상 실행된다.
* `npm run lint`가 통과한다.
* `npm run build`가 통과한다.
* 화면이 기획/디자인과 크게 어긋나지 않는다.
* loading 상태가 필요한 경우 처리되어 있다.
* error 상태가 필요한 경우 처리되어 있다.
* empty 상태가 필요한 경우 처리되어 있다.
* 입력값 validation이 필요한 경우 처리되어 있다.
* 모바일 화면에서 심하게 깨지지 않는다.
* Pull Request 리뷰 후 `develop`에 merge한다.

QA 또는 배포 시점에는 `develop`에서 `main`으로 Pull Request를 생성합니다.

---

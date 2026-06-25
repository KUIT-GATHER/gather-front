# Gather Frontend 개발 규칙

## 1. 브랜치 규칙

`main` 브랜치에는 직접 push하지 않습니다.
`main` 브랜치는 최종 배포용 브랜치로만 사용합니다.

기본 개발 브랜치는 `develop`입니다.
모든 기능 작업은 `develop` 브랜치에서 `feature/*` 브랜치를 생성해 진행합니다.

작업 브랜치는 아래 형식만 사용합니다.

```bash
feature/기능명
```

예시:

```bash
feature/email-login
feature/home
feature/team-create
feature/team-search
```

---

## 2. 커밋 메시지 규칙

커밋 메시지는 아래 형식을 사용합니다.

```bash
타입: 작업 내용
```

예시:

```bash
feat: 이메일 로그인 화면 구현
fix: 로그인 실패 메시지 표시 오류 수정
chore: GitHub Actions CI 설정 추가
docs: 개발 규칙 문서 추가
refactor: 팀 카드 컴포넌트 구조 개선
```

### 커밋 타입

| 타입 | 의미 |
|---|---|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| refactor | 기능 변화 없는 코드 구조 개선 |
| style | CSS, UI 스타일, 포맷팅 수정 |
| chore | 설정, 패키지, 빌드, 환경설정 작업 |
| docs | 문서 수정 |
| test | 테스트 코드 추가 또는 수정 |

### 커밋 메시지 작성 기준

- 한글로 작성합니다.
- 문장 끝에 마침표를 붙이지 않습니다.
- 한 커밋에는 하나의 작업만 담습니다.
- 너무 큰 단위로 커밋하지 않습니다.
- `수정`, `최종`, `작업` 같은 모호한 메시지는 사용하지 않습니다.

좋은 예:

```bash
feat: 팀 생성 폼 구현
fix: 팀 검색 결과 없음 UI 표시 오류 수정
style: 로그인 페이지 반응형 스타일 수정
chore: eslint 설정 추가
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

## 3. 작업 흐름

작업 시작 전 항상 `develop`을 최신 상태로 맞춥니다.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/작업명
```

작업 후 커밋합니다.

```bash
git add .
git commit -m "feat: 작업 내용"
git push origin feature/작업명
```

그다음 GitHub에서 Pull Request를 생성합니다.

PR 방향은 아래와 같습니다.

```bash
feature/작업명 → develop
```

`main`으로 직접 PR을 올리지 않습니다

---

## 4. Pull Request 규칙

PR에는 아래 내용을 작성합니다.

- 작업 내용
- 변경 사항
- 스크린샷 또는 화면 녹화
- 관련 이슈

PR 제목도 커밋 메시지 규칙과 동일하게 작성합니다.

예시:

```bash
feat: 이메일 로그인 화면 구현
fix: 팀 생성 validation 오류 수정
chore: 프로젝트 초기 설정 추가
```

---

## 5. 기능 완료 기준

기능은 아래 기준을 만족해야 완료로 봅니다.

- 로컬에서 정상 실행된다.
- `npm run lint`가 통과한다.
- `npm run build`가 통과한다.
- 화면이 기획/디자인과 크게 어긋나지 않는다.
- loading 상태가 필요한 경우 처리되어 있다.
- error 상태가 필요한 경우 처리되어 있다.
- empty 상태가 필요한 경우 처리되어 있다.
- 입력값 validation이 필요한 경우 처리되어 있다.
- 모바일 화면에서 심하게 깨지지 않는다.
- PR 리뷰 후 main에 merge한다.

# 프론트엔드·백엔드 계약 차이

이 문서는 프론트엔드가 백엔드 응답에 없는 값을 API 타입에 추가하지 않도록, 현재 UI 요구와 백엔드 계약 사이의 차이를 기록한다.

## 확인 기준

- 프론트 `develop`의 PR #36은 병합되어 있다. (`10474f5`)
- 조회 시점의 백엔드 `develop`은 `c66ca485`이며, 모임 카테고리를 `categoryId`에서 `category` enum으로 바꾸는 백엔드 PR #71은 GitHub에서 아직 열려 있었다.
- 이번 프론트는 제품 결정에 따라 PR #71의 병합 후 계약(`category: PostingCategory`)을 목표로 한다.
- 회원가입 관심 카테고리도 프론트에서는 6종 `PostingCategory` enum으로 통일했다. 조회 시점의 백엔드 `develop`은 아직 16종 `CategoryResponse`와 `interestCategoryIds`를 반환·요청하므로, 아래 항목은 백엔드 변경 전에는 실제 서버와 호환되지 않는다.

## 봉사공고

| 현재 프론트 요구사항        | 현재 백엔드 응답                                             | 이번 프론트 처리 방식                                                                  | 백엔드 변경 필요 여부                                 |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 카테고리별 카드·Hero 이미지 | 이미지 URL 없음                                              | 기존 6종 category puzzle SVG를 `getVolunteerPostingImage`로 해석해 로컬 asset으로 표시 | 아니오                                                |
| 인기순                      | popularity 없음                                              | UI를 신청자순으로 바꾸고 `applicantCount,desc` 서버 정렬 사용                          | 아니오                                                |
| 목록 카드 마감 D-day        | `PostingSummaryResponse`에 `noticeEndDate` 없음              | 목록에는 D-day를 표시하지 않음. 상세의 `noticeEndDate`에는 안전한 formatter를 제공     | 목록 DTO에 D-day 표시가 필요하면 예                   |
| 북마크 초기 상태            | 상세에 `bookmarked` 없음. 추가·삭제 API만 있음               | 상태를 추측하지 않고 북마크 버튼과 mutation UI를 숨김                                  | 예: 상세 `bookmarked`, 상태 조회, 또는 내 북마크 목록 |
| 신청 링크                   | 1365/VMS의 실제 신청 URL이 없음                              | 임시 외부 링크와 신청 dialog를 제거하고 "신청 경로 준비 중"으로 표시                   | 예                                                    |
| 공고별 연관 모임            | `GET /api/v1/postings/{postingId}/teams` 및 목록 filter 없음 | 가짜 호출·MSW handler를 제거하고 상세 영역을 준비 상태로 표시                          | 예: `volunteerPostingId` filter 또는 전용 endpoint    |
| 검색                        | 제목·모집기관명 부분일치                                     | MSW도 `title`, `recruitOrg`만 검색                                                     | 아니오                                                |
| 목록 기본 상태              | status 미지정 시 `RECRUITING`만 반환                         | MSW 및 목록 query가 동일하게 동작                                                      | 아니오                                                |

## 모임

| 현재 프론트 요구사항       | 현재/목표 백엔드 응답                                                    | 이번 프론트 처리 방식                                                   | 백엔드 변경 필요 여부                                      |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| 모임 카테고리              | 조회 시점 `develop`은 `categoryId`, PR #71은 `category: PostingCategory` | PR #71 병합 후 enum 계약으로 타입·query·MSW를 구현                      | PR #71 병합 필요                                           |
| 모임 이미지                | 목록 응답에 이미지 URL 없음                                              | API 타입에 `imageUrl`을 넣지 않고, 카드에는 카테고리 label 영역을 표시  | S3 URL이 필요하면 예                                       |
| 지역명                     | 목록에는 `regionId`만 있음                                               | ID나 임의 지역명을 카드에 표시하지 않음                                 | 목록에서 지역명이 필요하면 예, 또는 region dictionary 제공 |
| 공고 연관 여부             | 목록에 `volunteerPostingId` 없음                                         | 목록에서 공고 기반 여부를 표시하지 않음                                 | 목록에서 필요하면 예                                       |
| pagination·sort·popularity | 목록은 생성순 배열이며 pagination, sort, popularity 없음                 | 프론트 local sort를 하지 않음. Home만 서버 배열의 앞 5개를 표시         | 요구사항이 있으면 예                                       |
| endpoint 명칭              | 백엔드는 `/api/v1/meetings`, 기존 프론트는 `/api/v1/teams`               | 폴더·라우트 이름은 유지하고 API endpoint, 타입, MSW를 `meetings`로 변경 | 아니오                                                     |
| 공고별 팀 endpoint         | 존재하지 않음                                                            | 레거시 `/postings/{postingId}/teams` handler를 제거                     | 예                                                         |

## 카테고리·회원가입

| 현재 프론트 요구사항     | 조회 시점 백엔드 응답                                     | 이번 프론트 처리 방식                                                                              | 백엔드 변경 필요 여부                       |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 서비스 전체 6종 카테고리 | 공고는 6종 enum, 회원가입은 16종 DB ID                    | 프론트에서 16종 mapping·`stableIndex`·관심 카테고리 API를 제거하고 6종 enum·기존 SVG puzzle만 사용 | 예                                          |
| 회원가입 요청            | `interestCategoryIds: number[]`                           | 프론트는 `interestCategories: PostingCategory[]`를 전송하도록 전환                                 | 예: 최종 요청 field와 persistence 정책 확정 |
| 회원가입 카테고리 조회   | `GET /api/v1/categories`가 16종 `{ id, code, name }` 반환 | 프론트가 호출하지 않음                                                                             | 6종 정책에 맞는 endpoint가 필요하면 예      |

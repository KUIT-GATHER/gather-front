import postings from "./postings.json";

const POSTING_CATEGORIES = [
  "ENVIRONMENT",
  "EDUCATION",
  "CULTURE",
  "COMMUNITY",
  "WELFARE",
  "OVERSEAS",
] as const;

const additionalMockPostings = Array.from({ length: 11 }, (_, index) => {
  const id = index + 3;

  return {
    ...postings.data[0],
    id,
    title: `봉사공고 무한스크롤 테스트 ${id}`,
    status: "RECRUITING",
    recruitOrg: `테스트 모집기관 ${id}`,
    actStartDate: `2026-08-${String((index % 20) + 1).padStart(2, "0")}`,
    actEndDate: `2026-08-${String((index % 20) + 1).padStart(2, "0")}`,
    noticeStartDate: `2026-07-${String((index % 20) + 1).padStart(2, "0")}`,
    noticeEndDate: `2026-07-${String((index % 20) + 8).padStart(2, "0")}`,
    recruitCount: 10 + (index % 5),
    applicantCount: (index * 3) % 11,
    category: POSTING_CATEGORIES[index % POSTING_CATEGORIES.length],
    createdAt: `2026-07-${String((index % 20) + 1).padStart(2, "0")}T09:00:00`,
    updatedAt: `2026-07-${String((index % 20) + 1).padStart(2, "0")}T10:00:00`,
  };
});

export const mockPostings = [...postings.data, ...additionalMockPostings];

import { describe, expect, it } from "vitest";

import {
  getTeamListFilter,
  toTeamListQueryParams,
  updateTeamListSearchParams,
} from "./teamListSearchParams";

describe("team list search params", () => {
  it("필터와 검색어를 함께 API query params로 변환한다", () => {
    const searchParams = new URLSearchParams(
      "regionId=1&category=ENVIRONMENT&activityStartDate=2026-08-01&activityEndDate=2026-08-31&keyword=플로깅&sort=latest",
    );

    expect(toTeamListQueryParams(searchParams)).toMatchObject({
      regionId: 1,
      category: "ENVIRONMENT",
      activityStartDate: "2026-08-01",
      activityEndDate: "2026-08-31",
      keyword: "플로깅",
      status: "RECRUITING",
      size: 20,
      sort: ["createdAt,desc"],
    });
  });

  it("기존 필터를 유지한 채 검색어와 정렬만 갱신한다", () => {
    const current = new URLSearchParams(
      "regionId=1&category=ENVIRONMENT&activityStartDate=2026-08-01&activityEndDate=2026-08-31&keyword=이전검색어&sort=popular",
    );

    const next = updateTeamListSearchParams(
      current,
      getTeamListFilter(current),
      { keyword: " 플로깅 ", sort: "latest" },
    );

    expect(next.get("regionId")).toBe("1");
    expect(next.get("category")).toBe("ENVIRONMENT");
    expect(next.get("activityStartDate")).toBe("2026-08-01");
    expect(next.get("activityEndDate")).toBe("2026-08-31");
    expect(next.get("keyword")).toBe("플로깅");
    expect(next.get("sort")).toBe("latest");
  });
});

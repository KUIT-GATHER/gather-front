import { describe, expect, it } from "vitest";

import { normalizeMeetingCategories } from "./team.api";

describe("normalizeMeetingCategories", () => {
  it("구버전 단일 카테고리를 배열로 변환한다", () => {
    expect(
      normalizeMeetingCategories({ category: "ENVIRONMENT" }).categories,
    ).toEqual(["ENVIRONMENT"]);
  });

  it("다중 카테고리 배열을 그대로 사용한다", () => {
    expect(
      normalizeMeetingCategories({
        category: "ENVIRONMENT",
        categories: ["ENVIRONMENT", "COMMUNITY"],
      }).categories,
    ).toEqual(["ENVIRONMENT", "COMMUNITY"]);
  });

  it("카테고리 필드가 없으면 빈 배열을 사용한다", () => {
    expect(normalizeMeetingCategories({}).categories).toEqual([]);
  });
});

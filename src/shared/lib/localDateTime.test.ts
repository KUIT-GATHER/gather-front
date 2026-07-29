import { describe, expect, it } from "vitest";

import { combineLocalDateAndTime } from "./localDateTime";

describe("combineLocalDateAndTime", () => {
  it("공고 API의 시간 단위 값을 정각으로 변환한다", () => {
    expect(combineLocalDateAndTime("2026-10-28", "10")).toBe(
      "2026-10-28T10:00:00",
    );
  });

  it("유효하지 않은 시간은 거절한다", () => {
    expect(combineLocalDateAndTime("2026-10-28", "24")).toBeUndefined();
  });
});

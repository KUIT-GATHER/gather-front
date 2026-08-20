import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  combineLocalDateAndTime,
  formatLocalDateTimeAsUtcForApi,
  formatUtcApiDateTimeForInput,
  parseLocalDateTimeInput,
} from "./localDateTime";

let originalTimeZone: string | undefined;

beforeEach(() => {
  originalTimeZone = process.env.TZ;
  process.env.TZ = "Asia/Seoul";
});

afterEach(() => {
  if (originalTimeZone === undefined) {
    delete process.env.TZ;
    return;
  }

  process.env.TZ = originalTimeZone;
});

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

describe("모임 UTC LocalDateTime 변환", () => {
  it("KST로 선택한 시각을 API 왕복 후 같은 시각으로 표시한다", () => {
    const localDateTime = parseLocalDateTimeInput("2026-08-21T19:00");

    expect(localDateTime).toBeDefined();

    const apiDateTime = formatLocalDateTimeAsUtcForApi(localDateTime!);

    expect(apiDateTime).toBe("2026-08-21T10:00:00");
    expect(formatUtcApiDateTimeForInput(apiDateTime!)).toBe("2026-08-21T19:00");
  });

  it("UTC 변환으로 날짜가 전날이 되어도 사용자 시각을 유지한다", () => {
    const localDateTime = parseLocalDateTimeInput("2026-08-21T00:30");

    expect(localDateTime).toBeDefined();

    const apiDateTime = formatLocalDateTimeAsUtcForApi(localDateTime!);

    expect(apiDateTime).toBe("2026-08-20T15:30:00");
    expect(formatUtcApiDateTimeForInput(apiDateTime!)).toBe("2026-08-21T00:30");
  });
});

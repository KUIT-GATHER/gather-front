import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatBirthDateInput,
  formatPhoneNumber,
  isAllowedBirthDate,
  isRealPastOrTodayBirthDate,
  normalizeBirthDate,
  normalizeEmail,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";

function useReferenceDate() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-26T12:00:00.000Z"));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("signupFormatters", () => {
  it("전화번호에서 숫자가 아닌 문자를 제거하고 최대 11자리만 남긴다", () => {
    expect(normalizePhoneNumber("010-1234-5678abc90")).toBe("01012345678");
  });

  it("10자리와 11자리 전화번호를 다르게 표시한다", () => {
    expect(formatPhoneNumber("0101234567")).toBe("010-123-4567");
    expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678");
  });

  it("이메일의 앞뒤 공백을 제거하고 소문자로 변환한다", () => {
    expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
  });

  it("생년월일 입력값을 점 표기로 정리한다", () => {
    expect(formatBirthDateInput("2000-01-02")).toBe("2000. 01. 02");
    expect(normalizeBirthDate("2000. 01. 02")).toBe("2000-01-02");
  });

  it("실제로 존재하지 않는 생년월일과 미래 날짜를 거부한다", () => {
    useReferenceDate();

    expect(isRealPastOrTodayBirthDate("2025-02-29")).toBe(false);
    expect(isRealPastOrTodayBirthDate("2026-07-27")).toBe(false);
  });

  it("허용 범위의 첫 날짜와 오늘 날짜는 허용한다", () => {
    useReferenceDate();

    expect(isAllowedBirthDate("1900-01-01")).toBe(true);
    expect(isAllowedBirthDate("2026-07-26")).toBe(true);
  });

  it("1900년 1월 1일 이전 날짜는 거부한다", () => {
    useReferenceDate();

    expect(isAllowedBirthDate("1899-12-31")).toBe(false);
  });
});

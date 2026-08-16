import { describe, expect, it } from "vitest";

import { shouldLaunchSmsVerificationApp } from "@/features/auth/lib/phoneVerification";

describe("BasicInfoStep SMS navigation", () => {
  it("MSW 개발환경에서는 SMS 앱을 실행하지 않는다", () => {
    expect(shouldLaunchSmsVerificationApp(true, true)).toBe(false);
  });

  it("실제 SMS 연동 환경에서는 모바일 SMS 앱 실행을 유지한다", () => {
    expect(shouldLaunchSmsVerificationApp(true, false)).toBe(true);
  });

  it("desktop 환경에서는 SMS 앱 실행 대상이 아니다", () => {
    expect(shouldLaunchSmsVerificationApp(false, true)).toBe(false);
    expect(shouldLaunchSmsVerificationApp(false, false)).toBe(false);
  });
});

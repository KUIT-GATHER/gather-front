import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { usePhoneVerificationFlow } from "@/features/auth/hooks/usePhoneVerificationFlow";
import type { PhoneVerificationPurpose } from "@/features/auth/types/auth.types";
import { createTestQueryClient } from "@/test/createTestQueryClient";

type TestPhoneVerificationProps = {
  phoneNumber: string;
  purpose: PhoneVerificationPurpose;
};

function createWrapper() {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePhoneVerificationFlow", () => {
  it("VERIFIED 전에는 proof가 없고 VERIFIED 후 verificationId를 보관한다", async () => {
    const { result } = renderHook<
      ReturnType<typeof usePhoneVerificationFlow>,
      TestPhoneVerificationProps
    >(
      ({ phoneNumber, purpose }: TestPhoneVerificationProps) =>
        usePhoneVerificationFlow({ phoneNumber, purpose }),
      {
        initialProps: {
          phoneNumber: "01012345678",
          purpose: "FIND_ACCOUNT",
        } satisfies TestPhoneVerificationProps,
        wrapper: createWrapper(),
      },
    );

    act(() => result.current.handleVerifyPhone());

    await waitFor(() => {
      expect(result.current.isVerificationActive).toBe(true);
    });
    expect(result.current.phoneVerificationId).toBeNull();
    expect(result.current.isPhoneVerified).toBe(false);

    await waitFor(
      () => {
        expect(result.current.isPhoneVerified).toBe(true);
      },
      { timeout: 5_000 },
    );

    expect(result.current.phoneVerificationId).toEqual(expect.any(String));
  });

  it("전화번호와 purpose가 바뀌면 기존 proof를 초기화한다", async () => {
    const { result, rerender } = renderHook<
      ReturnType<typeof usePhoneVerificationFlow>,
      TestPhoneVerificationProps
    >(
      ({ phoneNumber, purpose }: TestPhoneVerificationProps) =>
        usePhoneVerificationFlow({ phoneNumber, purpose }),
      {
        initialProps: {
          phoneNumber: "01012345678",
          purpose: "FIND_ACCOUNT",
        } satisfies TestPhoneVerificationProps,
        wrapper: createWrapper(),
      },
    );

    act(() => {
      result.current.setVerifiedPhoneNumber("01012345678");
      result.current.setPhoneVerificationId("verification-id");
    });
    expect(result.current.isPhoneVerified).toBe(true);

    rerender({ phoneNumber: "01087654321", purpose: "FIND_ACCOUNT" });
    await waitFor(() => {
      expect(result.current.phoneVerificationId).toBeNull();
    });

    act(() => {
      result.current.setVerifiedPhoneNumber("01087654321");
      result.current.setPhoneVerificationId("verification-id");
    });
    rerender({ phoneNumber: "01087654321", purpose: "RESET_PASSWORD" });

    await waitFor(() => {
      expect(result.current.phoneVerificationId).toBeNull();
    });
  });
});

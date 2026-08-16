import { FormProvider, useForm } from "react-hook-form";
import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { AccountInfoStep } from "@/features/auth/components/signup/steps/AccountInfoStep";
import { emailSignupDefaultValues } from "@/features/auth/schemas/emailSignup.schema";
import type { EmailVerificationProof } from "@/features/auth/types/auth.types";
import { server } from "@/mocks/server";
import { renderWithProviders } from "@/test/renderWithProviders";

const EMAIL = "account-info@example.com";

type AccountInfoHarnessProps = {
  emailVerificationProof: EmailVerificationProof | null;
  onEmailVerificationProofChange: (
    value: EmailVerificationProof | null,
  ) => void;
};

function AccountInfoHarness({
  emailVerificationProof,
  onEmailVerificationProofChange,
}: AccountInfoHarnessProps) {
  const methods = useForm({
    defaultValues: {
      ...emailSignupDefaultValues,
      email: EMAIL,
    },
  });

  return (
    <FormProvider {...methods}>
      <AccountInfoStep
        emailVerificationProof={emailVerificationProof}
        onEmailVerificationProofChange={onEmailVerificationProofChange}
      />
    </FormProvider>
  );
}

function renderAccountInfo(
  emailVerificationProof: EmailVerificationProof | null = null,
) {
  const onEmailVerificationProofChange = vi.fn();
  const renderResult = renderWithProviders(
    <AccountInfoHarness
      emailVerificationProof={emailVerificationProof}
      onEmailVerificationProofChange={onEmailVerificationProofChange}
    />,
  );

  return { ...renderResult, onEmailVerificationProofChange };
}

describe("AccountInfoStep 이메일 인증 proof", () => {
  it("confirm 성공 시 이메일과 emailVerificationId를 함께 저장한다", async () => {
    const emailVerificationId = "email-verification-id";
    server.use(
      http.post("*/api/v1/auth/email-verifications", () =>
        HttpResponse.json({
          success: true,
          data: {
            email: EMAIL,
            expiresAt: new Date().toISOString(),
            message: "인증 코드가 발송되었습니다.",
          },
          error: null,
        }),
      ),
      http.post("*/api/v1/auth/email-verifications/confirm", () =>
        HttpResponse.json({
          success: true,
          data: {
            email: EMAIL,
            verified: true,
            verifiedAt: new Date().toISOString(),
            emailVerificationId,
          },
          error: null,
        }),
      ),
    );

    const { user, onEmailVerificationProofChange } = renderAccountInfo();

    await user.click(screen.getByRole("button", { name: "메일 인증" }));
    await user.type(
      await screen.findByPlaceholderText("인증번호 6자리"),
      "123456",
    );
    await user.click(screen.getByRole("button", { name: "인증하기" }));

    await waitFor(() => {
      expect(onEmailVerificationProofChange).toHaveBeenCalledWith({
        email: EMAIL,
        emailVerificationId,
      });
    });
  });

  it("인증메일 발송을 시작하면 기존 proof를 먼저 제거한다", async () => {
    server.use(
      http.post("*/api/v1/auth/email-verifications", () =>
        HttpResponse.json({
          success: true,
          data: {
            email: EMAIL,
            expiresAt: new Date().toISOString(),
            message: "인증 코드가 발송되었습니다.",
          },
          error: null,
        }),
      ),
    );

    const { user, onEmailVerificationProofChange } = renderAccountInfo({
      email: "previous@example.com",
      emailVerificationId: "previous-verification-id",
    });

    await user.click(screen.getByRole("button", { name: "메일 인증" }));

    expect(onEmailVerificationProofChange).toHaveBeenCalledWith(null);
  });
});

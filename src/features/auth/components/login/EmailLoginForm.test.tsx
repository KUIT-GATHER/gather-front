import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { EmailLoginForm } from "@/features/auth/components/login/EmailLoginForm";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { server } from "@/mocks/server";
import { renderWithProviders } from "@/test/renderWithProviders";

function renderEmailLoginForm() {
  const onLoginSuccess = vi.fn();
  const onSignupClick = vi.fn();
  const onRecoveryClick = vi.fn();
  const renderResult = renderWithProviders(
    <EmailLoginForm
      onLoginSuccess={onLoginSuccess}
      onSignupClick={onSignupClick}
      onRecoveryClick={onRecoveryClick}
    />,
  );

  return {
    ...renderResult,
    onLoginSuccess,
    onSignupClick,
    onRecoveryClick,
  };
}

async function fillValidCredentials(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await user.type(screen.getByLabelText("이메일"), "user@example.com");
  await user.type(screen.getByLabelText("비밀번호"), "password1");
}

describe("EmailLoginForm", () => {
  it("초기에는 로그인 버튼이 비활성화되어 있다", () => {
    renderEmailLoginForm();

    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });

  it("유효한 이메일과 비밀번호 입력 후 로그인 버튼을 활성화한다", async () => {
    const { user } = renderEmailLoginForm();

    await fillValidCredentials(user);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "로그인" })).toBeEnabled();
    });
  });

  it("비밀번호 보기와 숨기기 버튼을 전환한다", async () => {
    const { user } = renderEmailLoginForm();
    const passwordInput = screen.getByLabelText("비밀번호");

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "비밀번호 보기" }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "비밀번호 숨기기" }),
    ).toBeInTheDocument();
  });

  it("회원가입 버튼을 누르면 onSignupClick을 호출한다", async () => {
    const { onSignupClick, user } = renderEmailLoginForm();

    await user.click(screen.getByRole("button", { name: "회원가입" }));

    expect(onSignupClick).toHaveBeenCalledTimes(1);
  });

  it("아이디/비밀번호 찾기 버튼을 누르면 onRecoveryClick을 호출한다", async () => {
    const { onRecoveryClick, user } = renderEmailLoginForm();

    await user.click(
      screen.getByRole("button", { name: "아이디/비밀번호 찾기" }),
    );

    expect(onRecoveryClick).toHaveBeenCalledTimes(1);
  });

  it("INVALID_LOGIN 응답을 사용자용 오류 문구로 표시한다", async () => {
    server.use(
      http.post("*/api/v1/auth/login", () => {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "INVALID_LOGIN",
              message: "이메일 또는 비밀번호가 올바르지 않습니다.",
            },
          },
          { status: 401 },
        );
      }),
    );

    const { user } = renderEmailLoginForm();

    await fillValidCredentials(user);
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(
      await screen.findByText("이메일 또는 비밀번호가 올바르지 않습니다."),
    ).toBeInTheDocument();
  });

  it("로그인 성공 시 인증 상태를 저장하고 onLoginSuccess를 호출한다", async () => {
    server.use(
      http.post("*/api/v1/auth/login", () => {
        return HttpResponse.json({
          success: true,
          data: {
            accessToken: "test-access-token",
            tokenType: "Bearer",
          },
          error: null,
        });
      }),
    );

    const { onLoginSuccess, user } = renderEmailLoginForm();

    await fillValidCredentials(user);
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState()).toMatchObject({
        accessToken: "test-access-token",
        isAuthenticated: true,
      });
    });
  });
});

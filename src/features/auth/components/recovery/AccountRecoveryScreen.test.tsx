import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { AccountRecoveryScreen } from "@/features/auth/components/recovery/AccountRecoveryScreen";
import { renderWithProviders } from "@/test/renderWithProviders";

function renderRecovery(path = "/account-recovery") {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <AccountRecoveryScreen />
    </MemoryRouter>,
  );
}

describe("AccountRecoveryScreen", () => {
  it("아이디 찾기 탭으로 시작하고 인증 전 확인 버튼을 비활성화한다", () => {
    renderRecovery();

    expect(screen.getByRole("tab", { name: "아이디 찾기" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "비밀번호 찾기" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeDisabled();
  });

  it("올바르지 않은 전화번호에서는 인증을 시작할 수 없다", async () => {
    const { user } = renderRecovery();

    await user.type(screen.getByLabelText(/전화번호/), "01112345678");

    expect(screen.getByRole("button", { name: "인증하기" })).toBeDisabled();
  });

  it("비밀번호 찾기 탭은 reset password purpose 화면으로 전환된다", async () => {
    const { user } = renderRecovery();

    await user.click(screen.getByRole("tab", { name: "비밀번호 찾기" }));

    expect(screen.getByRole("tab", { name: "비밀번호 찾기" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "비밀번호 재설정" }),
    ).toBeDisabled();
  });
});

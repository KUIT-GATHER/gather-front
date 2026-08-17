import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { PasswordResetScreen } from "@/features/auth/components/recovery/PasswordResetScreen";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("PasswordResetScreen", () => {
  it("reset token 없는 직접 접근은 비밀번호 찾기 화면으로 되돌린다", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/account-recovery/password"]}>
        <Routes>
          <Route
            path="/account-recovery/password"
            element={<PasswordResetScreen />}
          />
          <Route
            path="/account-recovery"
            element={<output>password recovery</output>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("password recovery")).toBeInTheDocument();
    });
  });
});

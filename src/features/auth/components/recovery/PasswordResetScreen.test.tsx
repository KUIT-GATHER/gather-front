import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { PasswordResetScreen } from "@/features/auth/components/recovery/PasswordResetScreen";
import { renderWithProviders } from "@/test/renderWithProviders";

function LocationStateProbe() {
  const location = useLocation();

  return (
    <output data-testid="location-state">
      {location.state === null ? "null" : JSON.stringify(location.state)}
    </output>
  );
}

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

  it("유효한 reset token은 현재 화면의 memory state로 확보한 뒤 history state에서 제거한다", async () => {
    renderWithProviders(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/account-recovery/password",
            state: { passwordResetToken: "transient-token" },
          },
        ]}
      >
        <Routes>
          <Route
            path="/account-recovery/password"
            element={<PasswordResetScreen />}
          />
        </Routes>
        <LocationStateProbe />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-state")).toHaveTextContent("null");
    });
    expect(screen.getByLabelText("비밀번호 *")).toBeInTheDocument();
    expect(screen.getByTestId("location-state")).not.toHaveTextContent(
      "transient-token",
    );
  });
});

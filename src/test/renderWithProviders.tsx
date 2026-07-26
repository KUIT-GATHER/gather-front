import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createTestQueryClient } from "@/test/createTestQueryClient";

import type { RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

type CustomRenderOptions = Omit<RenderOptions, "wrapper">;

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, {
      wrapper: Wrapper,
      ...options,
    }),
  };
}

import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { server } from "@/mocks/server";

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();

  useAuthStore.setState({
    accessToken: null,
    isAuthenticated: false,
    authInitialized: false,
  });
});

afterAll(() => {
  server.close();
});

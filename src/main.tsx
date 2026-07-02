import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { AppProviders } from "@/app/providers";
import { router } from "@/app/router";

import "./index.css";

async function enableMocking() {
  const { env } = await import("@/shared/config/env");

  if (!env.ENABLE_MSW) {
    return;
  }

  const { worker } = await import("@/mocks/browser");

  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { AppProviders } from "@/app/providers";
import { router } from "@/app/router";
import { env } from "@/shared/config/env";

import "./index.css";

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }

  if (!env.ENABLE_MSW) {
    return;
  }

  const [{ worker }, { handleUnhandledRequest }] = await Promise.all([
    import("@/mocks/browser"),
    import("@/mocks/apiScope"),
  ]);

  return worker.start({
    onUnhandledRequest: handleUnhandledRequest,
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

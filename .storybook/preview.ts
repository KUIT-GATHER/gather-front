import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";
import addonMsw from "msw-storybook-addon";
import { setupWorker } from "msw/browser";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";

import { handleUnhandledRequest } from "../src/mocks/apiScope";

import "../src/index.css";

const gatherViewports = {
  ...MINIMAL_VIEWPORTS,
  gatherMobile: {
    name: "Gather Mobile",
    styles: { width: "402px", height: "844px" },
    type: "mobile" as const,
  },
  smallMobile: {
    name: "Small Mobile",
    styles: { width: "375px", height: "812px" },
    type: "mobile" as const,
  },
};

export default definePreview({
  tags: ["autodocs"],

  parameters: {
    viewport: {
      options: gatherViewports,
    },

    a11y: {
      // Existing design-token contrast issues are surfaced without blocking smoke tests.
      test: "todo",
    },
  },

  addons: [
    addonDocs(),
    addonA11y(),
    addonMsw(async () => {
      const worker = setupWorker();

      await worker.start({ onUnhandledRequest: handleUnhandledRequest });

      return worker;
    }),
  ],
});

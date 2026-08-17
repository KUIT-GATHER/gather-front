import type { Preview } from "@storybook/react-vite";
import { setupWorker } from "msw/browser";
import { mswLoader } from "msw-storybook-addon/csf3";
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

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    viewport: {
      options: gatherViewports,
    },
  },
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker();

      await worker.start({ onUnhandledRequest: handleUnhandledRequest });

      return worker;
    }),
  ],
};

export default preview;

import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.test.{ts,tsx}",
          "src/test/**",
          "src/mocks/**",
          "src/assets/**",
          "src/**/*.d.ts",
          "src/main.tsx",
          "src/**/*.stories.{ts,tsx}",
        ],
      },
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "jsdom",
            setupFiles: ["./src/test/setup.ts"],
            clearMocks: true,
            restoreMocks: true,
          },
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(rootDir, ".storybook"),
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: "chromium" }],
            },
          },
        },
      ],
    },
  }),
);

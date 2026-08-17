import { defineMain } from "@storybook/react-vite/node";

export default defineMain({
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "msw-storybook-addon",
  ],
  framework: "@storybook/react-vite",
  env: (config) => ({
    ...config,
    VITE_API_BASE_URL: "http://localhost:3000",
    VITE_ENABLE_MSW: "true",
    VITE_KAKAO_REST_API_KEY: "storybook-dummy",
    VITE_KAKAO_MAP_JAVASCRIPT_KEY: "storybook-dummy",
  }),
});

import { z } from "zod";

const modeSchema = z.enum(["development", "production", "staging", "test"]);

const envSchema = z.object({
  MODE: modeSchema,
  DEV: z.boolean(),
  PROD: z.boolean(),

  VITE_API_BASE_URL: z.url({ protocol: /^https?$/ })
});

const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  MODE: parsedEnv.MODE,

  IS_DEV: parsedEnv.DEV,
  IS_PROD: parsedEnv.PROD,
  IS_STAGING: parsedEnv.MODE === "staging",
  IS_TEST: parsedEnv.MODE === "test",

  API_BASE_URL: parsedEnv.VITE_API_BASE_URL,
} as const;
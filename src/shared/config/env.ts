import { z } from "zod";

const modeSchema = z.enum(["development", "production", "staging", "test"]);

const httpUrlSchema = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "VITE_API_BASE_URL must be a valid http(s) URL");

const envSchema = z.object({
  MODE: modeSchema,
  DEV: z.boolean(),
  PROD: z.boolean(),

  VITE_API_BASE_URL: httpUrlSchema,
  VITE_ENABLE_MSW: z.enum(["true", "false"]).default("false"),
});

const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  MODE: parsedEnv.MODE,

  IS_DEV: parsedEnv.DEV,
  IS_PROD: parsedEnv.PROD,
  IS_STAGING: parsedEnv.MODE === "staging",
  IS_TEST: parsedEnv.MODE === "test",

  API_BASE_URL: parsedEnv.VITE_API_BASE_URL,
  ENABLE_MSW: parsedEnv.VITE_ENABLE_MSW === "true",
} as const;

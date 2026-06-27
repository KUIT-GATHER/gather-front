import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.httpUrl()
});

const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  API_BASE_URL: parsedEnv.VITE_API_BASE_URL,
} as const;
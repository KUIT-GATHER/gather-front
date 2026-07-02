import { z } from "zod";

//환경변수 규칙 설정
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "VITE_API_BASE_URL must be a valid http(s) URL"),
  VITE_ENABLE_MSW: z.enum(["true", "false"]).default("false"),
});

//환경변수 검증
const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  API_BASE_URL: parsedEnv.VITE_API_BASE_URL,
  ENABLE_MSW: parsedEnv.VITE_ENABLE_MSW === "true",
} as const;

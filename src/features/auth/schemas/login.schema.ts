import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "이메일을 입력해 주세요." })
    .max(255, { error: "이메일은 최대 255자까지 입력할 수 있습니다." })
    .pipe(z.email({ error: "올바른 이메일 형식이 아닙니다." })),

  password: z.string().min(1, { error: "비밀번호를 입력해 주세요." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type LoginRequest = LoginFormValues;

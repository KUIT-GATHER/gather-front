import { z } from "zod";

import {
  passwordConfirmSchema,
  passwordSchema,
} from "@/shared/schemas/password.schema";

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "현재 비밀번호를 입력해 주세요." }),
    password: passwordSchema,
    passwordConfirm: passwordConfirmSchema,
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

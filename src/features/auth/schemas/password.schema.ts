import { z } from "zod";

import {
  passwordConfirmSchema,
  passwordSchema,
} from "@/shared/schemas/password.schema";

export {
  passwordConfirmSchema,
  passwordSchema,
} from "@/shared/schemas/password.schema";

export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: passwordConfirmSchema,
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

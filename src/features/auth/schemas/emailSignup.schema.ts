import { z } from "zod";

import {
  signupCommonDefaultValues,
  signupCommonSchema,
} from "@/features/auth/schemas/signupCommon.schema";

export const signupEmailSchema = z
  .object({
    ...signupCommonSchema.shape,
    email: z
      .string()
      .trim()
      .min(1, { error: "이메일을 입력해 주세요." })
      .max(255, { error: "이메일은 최대 255자까지 입력할 수 있습니다." })
      .pipe(z.email({ error: "올바른 이메일 형식이 아닙니다." })),
    emailVerificationCode: z
      .string()
      .regex(/^\d{6}$/, { error: "인증번호 6자리를 입력해 주세요." }),
    password: z
      .string()
      .min(6, { error: "비밀번호는 6자 이상이어야 합니다." })
      .max(12, { error: "비밀번호는 12자 이하이어야 합니다." })
      .regex(/^\S+$/, { error: "비밀번호에는 공백을 사용할 수 없습니다." }),
    passwordConfirm: z
      .string()
      .min(6, { error: "비밀번호 확인은 6자 이상이어야 합니다." })
      .max(12, { error: "비밀번호 확인은 12자 이하이어야 합니다." })
      .regex(/^\S+$/, {
        error: "비밀번호 확인에는 공백을 사용할 수 없습니다.",
      }),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type EmailSignupFormValues = z.infer<typeof signupEmailSchema>;
export type EmailSignupStepField = keyof EmailSignupFormValues;

export const emailSignupDefaultValues: EmailSignupFormValues = {
  ...signupCommonDefaultValues,
  email: "",
  emailVerificationCode: "",
  password: "",
  passwordConfirm: "",
};

export const signupEmailFieldSchema = signupEmailSchema.shape.email;

export const accountInfoFields = [
  "email",
  "emailVerificationCode",
  "password",
  "passwordConfirm",
] as const satisfies readonly EmailSignupStepField[];

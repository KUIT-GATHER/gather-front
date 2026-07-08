import { z } from "zod";

export const sendEmailVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email("올바른 이메일 형식이 아닙니다.")
    .max(255, "이메일은 최대 255자까지 입력할 수 있습니다."),
});

export const confirmEmailVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email("올바른 이메일 형식이 아닙니다.")
    .max(255, "이메일은 최대 255자까지 입력할 수 있습니다."),
  code: z.string().regex(/^\d{6}$/, "인증 코드는 6자리 숫자입니다."),
});

export type SendEmailVerificationFormValues = z.infer<
  typeof sendEmailVerificationSchema
>;

export type ConfirmEmailVerificationFormValues = z.infer<
  typeof confirmEmailVerificationSchema
>;

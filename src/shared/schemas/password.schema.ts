import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(6, { error: "비밀번호는 6자 이상이어야 합니다." })
  .max(12, { error: "비밀번호는 12자 이하이어야 합니다." })
  .regex(/^\S+$/, { error: "비밀번호에는 공백을 사용할 수 없습니다." });

export const passwordConfirmSchema = z
  .string()
  .min(6, { error: "비밀번호 확인은 6자 이상이어야 합니다." })
  .max(12, { error: "비밀번호 확인은 12자 이하이어야 합니다." })
  .regex(/^\S+$/, {
    error: "비밀번호 확인에는 공백을 사용할 수 없습니다.",
  });

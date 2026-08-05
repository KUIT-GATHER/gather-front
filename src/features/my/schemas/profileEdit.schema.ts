import { z } from "zod";

import { signupCommonSchema } from "@/features/auth/schemas/signupCommon.schema";

export const profileEditSchema = z.object({
  name: signupCommonSchema.shape.name,
  nickname: signupCommonSchema.shape.nickname,
  introduction: signupCommonSchema.shape.introduction,
  birthDate: signupCommonSchema.shape.birthDate,
  gender: z.enum(["MALE", "FEMALE"], {
    error: "성별을 선택해 주세요.",
  }),
  activityRegionId: signupCommonSchema.shape.activityRegionId,
  interestCategories: signupCommonSchema.shape.interestCategories,
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

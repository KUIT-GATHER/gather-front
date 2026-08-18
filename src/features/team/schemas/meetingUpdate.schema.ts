import { z } from "zod";

import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";

export const meetingUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "모임 이름을 입력해 주세요.")
    .max(15, "모임 이름은 15자 이내로 입력해 주세요."),
  description: z
    .string()
    .trim()
    .min(1, "모임 소개를 입력해 주세요.")
    .max(200, "모임 소개는 200자 이내로 입력해 주세요."),
  maxMember: z.number().int().min(2).max(30),
  deadline: z.string().min(1),
  categories: z
    .array(z.enum(POSTING_CATEGORIES))
    .min(1, "카테고리를 1개 이상 선택해 주세요.")
    .max(3, "카테고리는 최대 3개까지 선택할 수 있어요."),
  participationCondition: z.string().max(150),
  regionId: z.number().int().positive(),
  timeRecognized: z.boolean(),
});

export type MeetingUpdateFormValues = z.infer<typeof meetingUpdateSchema>;

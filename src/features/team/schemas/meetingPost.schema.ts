import { z } from "zod";

import type { ReviewSourceValue } from "@/features/team/types/meetingPost.types";

const reviewSourceValueSchema = z.custom<ReviewSourceValue>(
  (value) =>
    typeof value === "string" &&
    /^(POSTING|MEETING_RECRUIT):[1-9]\d*$/.test(value),
  "완료 활동을 선택해 주세요.",
);

export const meetingPostSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요.").max(15),
  content: z.string().trim().min(1, "내용을 입력해 주세요.").max(1000),
  reviewSourceValue: reviewSourceValueSchema.nullable(),
});

export type MeetingPostFormValues = z.infer<typeof meetingPostSchema>;

import { z } from "zod";

export const meetingPostSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요.").max(15),
  content: z.string().trim().min(1, "내용을 입력해 주세요.").max(1000),
  reviewSourceId: z.number().int().positive().nullable(),
});

export type MeetingPostFormValues = z.infer<typeof meetingPostSchema>;

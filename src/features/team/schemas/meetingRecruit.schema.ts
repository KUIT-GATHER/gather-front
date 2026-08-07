import { z } from "zod";

import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";
import { parseLocalDateTimeInput } from "@/shared/lib/localDateTime";

const localDateTimeField = z
  .string()
  .min(1, "날짜와 시간을 선택해 주세요.")
  .refine((value) => parseLocalDateTimeInput(value) !== undefined, {
    message: "날짜와 시간을 다시 선택해 주세요.",
  });

export const meetingRecruitSchema = z
  .object({
    title: z.string().trim().min(1, "활동 제목을 입력해 주세요.").max(15),
    content: z.string().trim().min(1, "활동 소개를 입력해 주세요.").max(1000),
    participationCondition: z.string().max(255),
    regionId: z.number().int().positive("지역을 선택해 주세요."),
    place: z.string().trim().min(1, "상세 장소를 입력해 주세요."),
    activityStartAt: localDateTimeField,
    activityEndAt: localDateTimeField,
    maxParticipants: z.number().int().min(1).max(50),
    categories: z.array(z.enum(POSTING_CATEGORIES)).min(1).max(3),
    timeRecognized: z.boolean(),
    recognizedMinutes: z.number().int().positive().nullable(),
    applyDeadlineAt: localDateTimeField,
    external: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.activityStartAt >= values.activityEndAt) {
      context.addIssue({
        code: "custom",
        path: ["activityEndAt"],
        message: "종료 시간은 시작 시간보다 늦어야 합니다.",
      });
    }

    if (values.applyDeadlineAt > values.activityStartAt) {
      context.addIssue({
        code: "custom",
        path: ["applyDeadlineAt"],
        message: "신청 마감은 활동 시작 이전이어야 합니다.",
      });
    }

    if (values.timeRecognized && values.recognizedMinutes === null) {
      context.addIssue({
        code: "custom",
        path: ["recognizedMinutes"],
        message: "인정 시간을 입력해 주세요.",
      });
    }

    if (!values.timeRecognized && values.recognizedMinutes !== null) {
      context.addIssue({
        code: "custom",
        path: ["recognizedMinutes"],
        message: "시간을 인정하지 않으면 인정 시간을 비워 주세요.",
      });
    }
  });

export type MeetingRecruitFormValues = z.infer<typeof meetingRecruitSchema>;

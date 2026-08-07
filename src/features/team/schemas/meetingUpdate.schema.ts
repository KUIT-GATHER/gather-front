import { z } from "zod";

import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";

export const meetingUpdateSchema = z.object({
  name: z.string().trim().min(1).max(15),
  description: z.string().trim().min(1).max(200),
  maxMember: z.number().int().min(2).max(30),
  deadline: z.string().min(1),
  categories: z.array(z.enum(POSTING_CATEGORIES)).min(1).max(3),
  participationCondition: z.string().max(150),
  regionId: z.number().int().positive(),
  timeRecognized: z.boolean(),
});

export type MeetingUpdateFormValues = z.infer<typeof meetingUpdateSchema>;

import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type VolunteerPostingFilter = {
  regionId?: number;
  activityStartDate?: string;
  activityEndDate?: string;
  category?: PostingCategory;
};

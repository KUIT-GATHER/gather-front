import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type VolunteerPostingFilter = {
  regionId?: number;
  regionGroupId?: number;
  noticeStartDate?: string;
  noticeEndDate?: string;
  category?: PostingCategory;
};

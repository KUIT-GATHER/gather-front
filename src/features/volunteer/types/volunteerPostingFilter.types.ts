import type { PostingCategory } from "@/features/category/types/postingCategory.types";

type VolunteerPostingFilterRegion =
  | {
      regionId?: never;
      regionGroupId?: never;
    }
  | {
      regionId: number;
      regionGroupId?: never;
    }
  | {
      regionId?: never;
      regionGroupId: number;
    };

type VolunteerPostingFilterDate =
  | {
      noticeStartDate?: never;
      noticeEndDate?: never;
    }
  | {
      noticeStartDate: string;
      noticeEndDate: string;
    };

export type VolunteerPostingFilter = VolunteerPostingFilterRegion &
  VolunteerPostingFilterDate & {
    category?: PostingCategory;
  };

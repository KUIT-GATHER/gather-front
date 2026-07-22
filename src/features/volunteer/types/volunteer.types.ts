import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type VolunteerPostingStatus = "RECRUITING" | "CLOSED" | "COMPLETED";

export type VolunteerPostingLocation = {
  locationSeq: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type VolunteerPosting = {
  id: number;
  title: string;
  status: VolunteerPostingStatus;
  content: string | null;

  recruitOrg: string | null;
  registerOrg: string | null;

  actStartDate: string | null;
  actEndDate: string | null;
  actStartTime: string | null;
  actEndTime: string | null;
  noticeStartDate: string | null;
  noticeEndDate: string | null;
  actWkdy: string | null;

  recruitCount: number | null;
  applicantCount: number | null;
  isAdult: boolean | null;
  isTeen: boolean | null;
  isGroup: boolean | null;

  actPlace: string | null;

  managerName: string | null;
  managerTel: string | null;
  managerFax: string | null;
  managerEmail: string | null;
  managerAddress: string | null;

  regionId: number | null;
  regionName: string | null;
  category: PostingCategory;

  locations: VolunteerPostingLocation[];

  createdAt: string | null;
  updatedAt: string | null;
  bookmarked: boolean;
};

export type VolunteerPostingListItem = {
  id: number;
  title: string;
  status: VolunteerPostingStatus;
  recruitOrg: string | null;
  actStartDate: string | null;
  actEndDate: string | null;
  actPlace: string | null;
  recruitCount: number | null;
  applicantCount: number | null;
  regionId: number | null;
  regionName: string | null;
  category: PostingCategory;
  noticeEndDate: string | null;
};

export type VolunteerPostingPage = {
  content: VolunteerPostingListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type VolunteerPostingBookmarkResponse = {
  postingId: number;
  bookmarked: boolean;
};

export type VolunteerPostingParticipationStatus =
  | "APPLIED"
  | "CONFIRMED"
  | "COMPLETED"
  | "REVIEWED";

export type VolunteerPostingParticipationResponse = {
  participationId: number;
  status: VolunteerPostingParticipationStatus;
  applicationUrl: string;
};

type VolunteerPostingRegionFilter =
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

type VolunteerPostingBaseParams = {
  page?: number;
  size?: number;
  sort?: string[];
  status?: VolunteerPostingStatus;
  noticeStartDate?: string;
  noticeEndDate?: string;
  keyword?: string;
  category?: PostingCategory;
};

export type VolunteerPostingListParams = VolunteerPostingBaseParams &
  VolunteerPostingRegionFilter;

export type VolunteerPostingInfiniteParams = Omit<
  VolunteerPostingBaseParams,
  "page"
> &
  VolunteerPostingRegionFilter;

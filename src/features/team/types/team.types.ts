import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type MeetingStatus = "RECRUITING" | "CLOSED" | "COMPLETED";

export type MeetingListItem = {
  meetingId: number;
  name: string;
  description: string | null;
  currentMemberCount: number;
  maxMember: number;
  regionId: number;
  category: PostingCategory;
  status: MeetingStatus;
  deadline: string;
  activityStartAt: string;
};

export type MeetingDetail = MeetingListItem & {
  hostId: number;
  volunteerPostingId: number | null;
  participationCondition: string | null;
  memo: string | null;
  activityEndAt: string;
  bookmarked?: boolean;
};

export type MeetingListParams = {
  keyword?: string;
  regionId?: number;
  category?: PostingCategory;
  status?: MeetingStatus;
  page?: number;
  size?: number;
  sort?: string[];
};

export type MeetingPage = {
  content: MeetingListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type MeetingBookmarkResponse = {
  meetingId: number;
  bookmarked: boolean;
};

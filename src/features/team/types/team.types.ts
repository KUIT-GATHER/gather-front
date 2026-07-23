import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type MeetingStatus = "RECRUITING" | "CLOSED" | "COMPLETED";
export type MeetingMemberRole = "HOST" | "MEMBER";
export type MeetingPostType = "NOTICE" | "REVIEW" | "RECRUIT" | "FREE";
export type TeamViewerRole = "guest" | "member" | "leader";
export type TeammateViewerRole = Exclude<TeamViewerRole, "guest">;

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

export type MeetingCreateRequest = {
  name: string;
  description?: string | null;
  maxMember: number;
  deadline: string;
  memo?: string | null;
  category?: PostingCategory;
  regionId: number;
  participationCondition?: string | null;
  volunteerPostingId?: number | null;
  activityStartAt: string;
  activityEndAt: string;
};

export type MeetingDetail = MeetingListItem & {
  hostId: number;
  volunteerPostingId: number | null;
  participationCondition: string | null;
  memo: string | null;
  activityEndAt: string;
  bookmarked?: boolean;
};

export type MeetingMember = {
  userId: number;
  nickname: string;
  role: MeetingMemberRole;
  host: boolean;
};

export type UpcomingActivity = {
  postingId: number;
  title: string;
  activityDate: string;
  startTime: string | null;
  endTime: string | null;
  place: string | null;
  remainingCount: number;
  status: MeetingStatus;
};

export type MeetingHome = {
  meetingId: number;
  name: string;
  description: string | null;
  deadline: string;
  regionName: string | null;
  currentMemberCount: number;
  maxMember: number;
  timeVerified: boolean;
  status: MeetingStatus;
  basedOnPosting: boolean;
  linkedPostingId: number | null;
  linkedPostingTitle: string | null;
  participationCondition: string | null;
  members: MeetingMember[];
  upcomingActivity: UpcomingActivity | null;
  member: boolean;
  host: boolean;
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

export type MeetingPostListParams = {
  type?: MeetingPostType;
};

export type MeetingPostSummary = {
  postId: number;
  type: MeetingPostType;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

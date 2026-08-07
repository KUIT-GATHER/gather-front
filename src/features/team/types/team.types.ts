import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type { UserStatus } from "@/shared/types/user.types";

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
  regionName: string;
  categories: PostingCategory[];
  status: MeetingStatus;
  deadline: string;
  activityStartAt: string;
};

export type MyMeetingListItem = MeetingListItem & {
  viewerRole: MeetingMemberRole;
};

export type MeetingCreateRequest = {
  name: string;
  description?: string | null;
  maxMember: number;
  deadline: string;
  memo?: string | null;
  categories: PostingCategory[];
  regionId: number;
  participationCondition?: string | null;
  volunteerPostingId?: number | null;
  activityStartAt: string | null;
  activityEndAt: string | null;
};

export type MeetingDetail = MeetingListItem & {
  hostId: number;
  volunteerPostingId: number | null;
  participationCondition: string | null;
  memo: string | null;
  activityEndAt: string;
  bookmarked: boolean;
};

export type MeetingMember = {
  userId: number;
  nickname: string;
  userStatus?: UserStatus;
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
  activityStartDate?: string;
  activityEndDate?: string;
  postingBasedFirst?: boolean;
  page?: number;
  size?: number;
  sort?: string[];
};

export type BookmarkedMeetingListParams = {
  keyword?: string;
  regionId?: number;
  category?: PostingCategory;
  activityStartDate?: string;
  activityEndDate?: string;
  page?: number;
  size?: number;
};

export type MeetingInfiniteParams = Omit<MeetingListParams, "page">;
export type BookmarkedMeetingInfiniteParams = Omit<
  BookmarkedMeetingListParams,
  "page"
>;

export type MeetingPage = {
  content: MeetingListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type BookmarkedMeetingListItem = Omit<MeetingListItem, "regionName"> & {
  regionName: string | null;
};

export type BookmarkedMeetingPage = Omit<MeetingPage, "content"> & {
  content: BookmarkedMeetingListItem[];
};

export type MeetingBookmarkResponse = {
  meetingId: number;
  bookmarked: boolean;
};

export type MeetingPostListParams = {
  types?: readonly MeetingPostType[];
  page?: number;
  size?: number;
  sort?: string[];
};

export type MeetingPostSummary = {
  postId: number;
  type: MeetingPostType;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  userStatus?: UserStatus;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
};

export type MeetingPost = MeetingPostSummary & {
  meetingId: number;
  recruitCapacity: number | null;
  canEdit: boolean;
  canDelete: boolean;
  updatedAt: string;
};

export type MeetingPostPage = {
  content: MeetingPostSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type MeetingPostLikeResponse = {
  liked: boolean;
  likeCount: number;
};

export type MeetingPostCommentListParams = {
  page?: number;
  size?: number;
  sort?: string[];
};

export type MeetingPostComment = {
  commentId: number;
  authorId: number;
  authorNickname: string;
  userStatus?: UserStatus;
  content: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type MeetingPostCommentPage = {
  content: MeetingPostComment[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type MeetingActivityListParams = {
  page?: number;
  size?: number;
  sort?: string[];
};

export type MyMeetingActivitySummary = {
  writtenPostCount: number;
  commentedPostCount: number;
  appliedRecruitCount: number;
};

export type MeetingRecruitParticipationStatus = "APPLIED";

export type MyAppliedRecruit = {
  postId: number;
  meetingId: number;
  title: string;
  place: string | null;
  actDate: string;
  actStartTime: string | null;
  actEndTime: string | null;
  status: MeetingRecruitParticipationStatus;
};

export type MyAppliedRecruitPage = {
  content: MyAppliedRecruit[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type MeetingPostCommentCreateRequest = {
  content: string;
};

export type MeetingPostCommentUpdateRequest = {
  content: string;
};

type MeetingPostCreateBaseRequest = {
  title: string;
  content: string;
  imageObjectKeys?: string[];
};

export type MeetingPostCreateGeneralRequest = MeetingPostCreateBaseRequest & {
  type: Exclude<MeetingPostType, "RECRUIT">;
};

export type MeetingPostCreateRecruitRequest = MeetingPostCreateBaseRequest & {
  type: "RECRUIT";
  recruitCapacity: number;
};

export type MeetingPostCreateRequest =
  | MeetingPostCreateGeneralRequest
  | MeetingPostCreateRecruitRequest;

export type MeetingPostUpdateRequest = {
  title: string;
  content: string;
};

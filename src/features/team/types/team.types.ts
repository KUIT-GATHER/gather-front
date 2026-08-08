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
  thumbnailUrl: string | null;
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
  timeRecognized: boolean;
};

export type MeetingDetail = MeetingListItem & {
  hostId: number;
  volunteerPostingId: number | null;
  participationCondition: string | null;
  memo: string | null;
  activityEndAt: string;
  bookmarked: boolean;
  timeRecognized: boolean;
};

export type MeetingUpdateRequest = {
  name: string;
  description: string | null;
  maxMember: number;
  deadline: string;
  categories: PostingCategory[] | null;
  participationCondition: string | null;
  regionId: number | null;
  timeRecognized: boolean;
};

export type MeetingMember = {
  userId: number;
  nickname: string;
  userStatus?: UserStatus;
  role: MeetingMemberRole;
  host: boolean;
};

export type MeetingJoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MeetingJoinRequest = {
  joinRequestId: number;
  userId: number;
  nickname: string;
  status: MeetingJoinRequestStatus;
  requestedAt: string;
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
  timeRecognized: boolean;
  status: MeetingStatus;
  basedOnPosting: boolean;
  linkedPostingId: number | null;
  linkedPostingTitle: string | null;
  participationCondition: string | null;
  members: MeetingMember[];
  upcomingActivity: UpcomingActivity | null;
  member: boolean;
  host: boolean;
  pendingJoinRequested: boolean;
  myPendingJoinRequestId: number | null;
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

export type MeetingRecruitParticipationStatus =
  | "APPLIED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "REVIEWED";

export type MyAppliedRecruit = {
  postId: number;
  meetingId: number;
  title: string;
  place: string | null;
  activityStartAt: string;
  activityEndAt: string;
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

export type {
  MeetingPostCreateRequest,
  MeetingPostUpdateRequest,
} from "@/features/team/types/meetingPost.types";
export type { MeetingRecruitDetail } from "@/features/team/types/meetingRecruit.types";

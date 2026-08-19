import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type { MeetingStatus } from "@/features/team/types/team.types";

export type VolunteerPostingStatus = "RECRUITING" | "CLOSED" | "COMPLETED";
export type VolunteerPostingSource = "API_1365" | "VMS_CRAWL";

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
  source: VolunteerPostingSource;
  applicationUrl: string | null;
  bookmarked: boolean;
  participationStatus: VolunteerPostingParticipationStatus | null;
  participationStartDate: string | null;
  participationEndDate: string | null;
  participationAction: VolunteerPostingParticipationAction;
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

export type PostingListItemBase = {
  id: number;
  title: string;
  organizationName: string | null;
  thumbnailUrl: string | null;
  regionId: number | null;
  regionName: string | null;
  place: string | null;
  activityStartAt: string | null;
  activityEndAt: string | null;
  applyDeadlineAt: string | null;
  maxParticipants: number | null;
  appliedCount: number | null;
  categories: PostingCategory[];
  status: string;
};

export type PostingListItem =
  | (PostingListItemBase & { sourceType: "POSTING"; meetingId: null })
  | (PostingListItemBase & {
      sourceType: "MEETING_RECRUIT";
      meetingId: number;
    });

export type PostingListCursorPage = {
  content: PostingListItem[];
  nextCursor: string | null;
  hasNext: boolean;
};

export type VolunteerPostingPage = {
  content: VolunteerPostingListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type VolunteerPostingMeeting = {
  meetingId: number;
  name: string;
  categories: PostingCategory[];
  currentMemberCount: number;
  maxMember: number;
  regionId: number;
  regionName: string;
  status: MeetingStatus;
  member: boolean;
  host: boolean;
};

export type VolunteerPostingMeetingPage = {
  content: VolunteerPostingMeeting[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type VolunteerPostingMeetingListParams = {
  page?: number;
  size?: number;
  sort?: string[];
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

export type VolunteerPostingParticipationAction =
  | "APPLY"
  | "CANCEL"
  | "COMPLETE"
  | "NONE";

export type VolunteerPostingParticipationResponse = {
  participationId: number;
  status: VolunteerPostingParticipationStatus;
  participationStartDate: string;
  participationEndDate: string;
};

export type VolunteerPostingParticipationApplyRequest = {
  participationStartDate: string;
  participationEndDate: string;
};

export type VolunteerPostingBaseParams = {
  size?: number;
  sort?: string[];
  status?: VolunteerPostingStatus;
  activityStartDate?: string;
  activityEndDate?: string;
  keyword?: string;
  category?: PostingCategory;
  regionId?: number;
};

export type VolunteerPostingCursorListParams = VolunteerPostingBaseParams & {
  cursor?: string;
};

export type VolunteerPostingOffsetListParams = VolunteerPostingBaseParams & {
  page?: number;
};

export type VolunteerPostingInfiniteParams = VolunteerPostingBaseParams;

export type VolunteerPostingMapBounds = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
};

export type VolunteerPostingMapParams = VolunteerPostingMapBounds & {
  regionId?: number;
  activityStartDate?: string;
  activityEndDate?: string;
  category?: PostingCategory;
};

export type VolunteerPostingMapItem = {
  id: number;
  title: string;
  organizationName: string | null;
  regionId: number | null;
  regionName: string | null;
  activityStartAt: string | null;
  activityEndAt: string | null;
  applyDeadlineAt: string | null;
  category: PostingCategory;
  status: VolunteerPostingStatus;
  locations: VolunteerPostingLocation[];
};

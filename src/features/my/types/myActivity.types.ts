import type { PostingCategory } from "@/features/category/types/postingCategory.types";

type MyPageActivityBase = {
  title: string;
  actStartDate: string;
  actEndDate: string | null;
  actStartTime: string | null;
  actEndTime: string | null;
  actPlace: string | null;
  regionName: string | null;
};

export type MyVolunteerActivityStatus =
  | "APPLIED"
  | "CONFIRMED"
  | "COMPLETED"
  | "REVIEWED";

export type MyPageParticipationAction = "CANCEL" | "NONE";

export type MyVolunteerActivity = MyPageActivityBase & {
  activityType: "VOLUNTEER";
  participationId: number;
  postingId: number;
  meetingId: null;
  status: MyVolunteerActivityStatus;
  participationAction: MyPageParticipationAction;
};

export type MyMeetingRecruitActivity = MyPageActivityBase & {
  activityType: "MEETING_RECRUIT";
  participationId: number;
  meetingId: number;
  postId: number;
  status: MyVolunteerActivityStatus;
  participationAction: MyPageParticipationAction;
};

export type MyPageActivity = MyVolunteerActivity | MyMeetingRecruitActivity;

export type MyActivitySummary = {
  totalCompletedCount: number;
  totalRecognizedMinutes: number;
  timeCertifiableCompletedCount: number;
  categoryBlocks: Array<{
    category: PostingCategory;
    count: number;
  }>;
};

export type MyActivityRecord = {
  participationId: number;
  postingId: number;
  title: string;
  category: PostingCategory;
  actStartDate: string | null;
  actEndDate: string | null;
  actPlace: string | null;
  timeCertifiable: boolean;
  recognizedMinutes: number | null;
};

export type MyActivityRecordPage = {
  content: MyActivityRecord[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

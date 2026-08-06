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

export type MyMeetingActivityStatus = "RECRUITING" | "CLOSED" | "COMPLETED";

export type MyVolunteerActivity = MyPageActivityBase & {
  activityType: "VOLUNTEER";
  participationId: number;
  postingId: number;
  meetingId: null;
  status: MyVolunteerActivityStatus;
};

export type MyMeetingActivity = MyPageActivityBase & {
  activityType: "MEETING";
  participationId: null;
  postingId: null;
  meetingId: number;
  volunteerPostingId: number | null;
  status: null;
  meetingStatus: MyMeetingActivityStatus;
  postingParticipationStatus: MyVolunteerActivityStatus | null;
};

export type MyPageActivity = MyVolunteerActivity | MyMeetingActivity;

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

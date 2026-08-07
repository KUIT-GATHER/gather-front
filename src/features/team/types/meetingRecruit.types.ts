import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type RecruitApplicantType = "MEMBER" | "EXTERNAL";
export type RecruitParticipationStatus =
  | "APPLIED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "REVIEWED";
export type RecruitParticipationAction = "APPLY" | "CANCEL" | "NONE";
export type RecruitConfirmationStatus = "UNCONFIRMED" | "CONFIRMED";
export type RecruitAttendanceStatus = "UNSET" | "PRESENT" | "ABSENT";

export type MeetingRecruitRequest = {
  title: string;
  content: string;
  participationCondition: string | null;
  regionId: number;
  place: string;
  activityStartAt: string;
  activityEndAt: string;
  maxParticipants: number;
  categories: PostingCategory[];
  timeRecognized: boolean;
  recognizedMinutes: number | null;
  applyDeadlineAt: string;
  external: boolean;
};

export type MeetingRecruitDetail = MeetingRecruitRequest & {
  postId: number;
  meetingId: number;
  meetingName: string;
  authorId: number;
  authorNickname: string;
  regionName: string;
  likeCount: number;
  commentCount: number;
  appliedCount: number;
  participationStatus: RecruitParticipationStatus | null;
  participationAction: RecruitParticipationAction;
  applicationOpen: boolean;
  full: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RecruitParticipationResponse = {
  participationId: number;
  participationStatus: RecruitParticipationStatus;
  participationAction: RecruitParticipationAction;
  appliedCount: number;
};

export type ManagedMeetingRecruit = {
  postId: number;
  title: string;
  place: string;
  activityStartAt: string;
  activityEndAt: string;
  applyDeadlineAt: string;
  appliedCount: number;
  maxParticipants: number;
  external: boolean;
  applicationOpen: boolean;
  confirmationStatus: RecruitConfirmationStatus;
  confirmedAt: string | null;
  canEdit: boolean;
};

export type RecruitParticipantSummary = {
  participationId: number;
  userId: number;
  nickname: string;
  applicantType: RecruitApplicantType;
  participationStatus: RecruitParticipationStatus;
  attendanceStatus: RecruitAttendanceStatus;
  appliedAt: string;
};

export type RecruitParticipantsResponse = {
  postId: number;
  confirmationStatus: RecruitConfirmationStatus;
  confirmedAt: string | null;
  activityStartAt: string;
  activityEndAt: string;
  participants: RecruitParticipantSummary[];
};

export type RecruitParticipantDetail = RecruitParticipantSummary & {
  phoneNumber: string;
  birthDate: string;
  regionId: number;
  regionName: string;
  interestCategories: PostingCategory[];
  totalRecognizedMinutes: number;
};

export type RejectParticipantResponse = {
  participationId: number;
  participationStatus: "REJECTED";
  attendanceStatus: "UNSET";
  updatedAt: string;
};

export type ConfirmRecruitParticipantsResponse = {
  postId: number;
  confirmationStatus: "CONFIRMED";
  confirmedAt: string;
  confirmedCount: number;
};

export type UpdateAttendanceRequest = {
  attendanceStatus: Exclude<RecruitAttendanceStatus, "UNSET">;
};

export type UpdateAttendanceResponse = {
  participationId: number;
  participationStatus: "CONFIRMED" | "COMPLETED";
  attendanceStatus: "PRESENT" | "ABSENT";
  recognizedMinutesApplied: number;
  updatedAt: string;
};

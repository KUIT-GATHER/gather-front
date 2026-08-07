import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type {
  MeetingJoinRequestStatus,
  MeetingMemberRole,
} from "@/features/team/types/team.types";

export type MeetingJoinResponse = {
  joinRequestId: number;
  meetingId: number;
  status: "PENDING";
};

export type MeetingJoinRequestDetail = {
  joinRequestId: number;
  userId: number;
  nickname: string;
  status: MeetingJoinRequestStatus;
  requestedAt: string;
  phoneNumber: string;
  birthDate: string;
  regionId: number;
  regionName: string;
  interestCategories: PostingCategory[];
  totalRecognizedMinutes: number;
};

export type MeetingMemberDetail = {
  userId: number;
  nickname: string;
  role: MeetingMemberRole;
  phoneNumber: string;
  birthDate: string;
  regionId: number;
  regionName: string;
  interestCategories: PostingCategory[];
  totalRecognizedMinutes: number;
};

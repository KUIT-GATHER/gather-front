import type { MeetingPostType } from "@/features/team/types/team.types";

export const MEETING_POST_TYPE_LABELS: Record<MeetingPostType, string> = {
  NOTICE: "공지",
  REVIEW: "활동 후기",
  RECRUIT: "모집 공고",
  FREE: "자유",
};

export const MEETING_POST_TYPES: readonly MeetingPostType[] = [
  "NOTICE",
  "REVIEW",
  "RECRUIT",
  "FREE",
];

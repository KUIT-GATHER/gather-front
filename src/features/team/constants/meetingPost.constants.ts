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

export const MEETING_POST_TYPE_BADGE_CLASS_NAMES: Record<
  MeetingPostType,
  string
> = {
  NOTICE: "bg-[#FFD6DB] text-point-red",
  REVIEW: "bg-[#DCECDF] text-button",
  RECRUIT: "bg-[#FFF3FF] text-[#D197D1]",
  FREE: "bg-stroke/70 text-text-gray-400",
};

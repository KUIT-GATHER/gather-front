import { fetchClient } from "@/shared/api/fetchClient";

export const myBadgeKeys = {
  all: ["mypage", "badges"] as const,
};

export type BadgeType =
  | "FIRST_COMPLETION"
  | "BOOKMARK_5"
  | "FIRST_TEAM_JOIN"
  | "FIRST_REVIEW"
  | "COMMENT_10"
  | "COMPLETION_5"
  | "CONSECUTIVE_3_MONTHS"
  | "TEAM_CREATED";

export type MyBadge = {
  badgeType: BadgeType;
  title: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
  currentValue: number;
  targetValue: number;
};

export function getMyBadges() {
  return fetchClient<MyBadge[]>("/api/v1/mypage/badges");
}

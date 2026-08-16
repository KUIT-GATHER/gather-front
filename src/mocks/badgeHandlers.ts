import { HttpResponse, http } from "msw";

import type { BadgeType, MyBadge } from "@/features/my/types/myBadge.types";
import { formatLocalDateTimeForApi } from "@/shared/lib/localDateTime";

import { createUnauthorizedResponse, getMockUserId } from "./lib/mockAuth";
import { getGatherApiUrl } from "./apiScope";

const initialBadges = [
  {
    badgeType: "FIRST_COMPLETION",
    title: "첫 봉사활동 완료",
    description: "첫 봉사활동을 완료했어요",
    earned: true,
    earnedAt: "2026-03-15T19:00:00",
    currentValue: 1,
    targetValue: 1,
  },
  {
    badgeType: "BOOKMARK_5",
    title: "봉사공고 5개 북마크",
    description: "봉사공고를 5개 북마크했어요",
    earned: true,
    earnedAt: "2026-03-01T10:30:00",
    currentValue: 5,
    targetValue: 5,
  },
  {
    badgeType: "FIRST_TEAM_JOIN",
    title: "팀에 처음 가입하기",
    description: "처음으로 팀에 가입했어요",
    earned: false,
    earnedAt: null,
    currentValue: 0,
    targetValue: 1,
  },
  {
    badgeType: "FIRST_REVIEW",
    title: "봉사후기 작성하기",
    description: "첫 봉사후기를 작성했어요",
    earned: false,
    earnedAt: null,
    currentValue: 0,
    targetValue: 1,
  },
  {
    badgeType: "COMMENT_10",
    title: "게시글에 10회 댓글달기",
    description: "게시글에 댓글을 10회 남겼어요",
    earned: false,
    earnedAt: null,
    currentValue: 4,
    targetValue: 10,
  },
  {
    badgeType: "COMPLETION_5",
    title: "봉사 5회 완료",
    description: "봉사활동을 5회 완료했어요",
    earned: false,
    earnedAt: null,
    currentValue: 2,
    targetValue: 5,
  },
  {
    badgeType: "CONSECUTIVE_3_MONTHS",
    title: "3달 연속봉사 참여하기",
    description: "3개월 연속으로 봉사에 참여했어요",
    earned: false,
    earnedAt: null,
    currentValue: 1,
    targetValue: 3,
  },
  {
    badgeType: "TEAM_CREATED",
    title: "팀을 직접 만들기",
    description: "직접 팀을 만들었어요",
    earned: false,
    earnedAt: null,
    currentValue: 0,
    targetValue: 1,
  },
] satisfies MyBadge[];

const badgesByUserId = new Map<number, MyBadge[]>();

export function getMockBadges(userId: number) {
  const existing = badgesByUserId.get(userId);
  if (existing) return existing;

  const badges = initialBadges.map((badge) => ({ ...badge }));
  badgesByUserId.set(userId, badges);
  return badges;
}

export function addMockBadgeProgress(
  userId: number,
  badgeType: BadgeType,
  amount = 1,
) {
  const badge = getMockBadges(userId).find(
    (candidate) => candidate.badgeType === badgeType,
  );
  if (!badge || badge.earned) return;

  badge.currentValue = Math.min(
    badge.targetValue,
    Math.max(0, badge.currentValue + amount),
  );

  if (badge.currentValue === badge.targetValue) {
    badge.earned = true;
    badge.earnedAt = formatLocalDateTimeForApi(new Date()) ?? null;
  }
}

export function earnMockBadge(userId: number, badgeType: BadgeType) {
  const badge = getMockBadges(userId).find(
    (candidate) => candidate.badgeType === badgeType,
  );
  if (!badge || badge.earned) return;

  addMockBadgeProgress(userId, badgeType, badge.targetValue);
}

export function resetMockBadges() {
  badgesByUserId.clear();
}

export const badgeHandlers = [
  http.get(getGatherApiUrl("/api/v1/mypage/badges"), ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    return HttpResponse.json({
      success: true,
      data: getMockBadges(userId),
      error: null,
    });
  }),
];

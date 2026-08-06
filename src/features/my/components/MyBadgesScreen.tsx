import { useNavigate } from "react-router";

import activityBadgeIcon from "@/features/my/assets/activity-badge.svg";
import bookmark5Icon from "@/features/my/assets/badge-bookmark-5.svg";
import comment10Icon from "@/features/my/assets/badge-comment-10.svg";
import completion5Icon from "@/features/my/assets/badge-completion-5.svg";
import consecutive3MonthsIcon from "@/features/my/assets/badge-consecutive-3-months.svg";
import firstCompletionIcon from "@/features/my/assets/badge-first-completion.svg";
import firstReviewIcon from "@/features/my/assets/badge-first-review.svg";
import firstTeamJoinIcon from "@/features/my/assets/badge-first-team-join.svg";
import lockIcon from "@/features/my/assets/badge-lock.svg";
import teamCreatedIcon from "@/features/my/assets/badge-team-created.svg";
import { useMyBadgesQuery } from "@/features/my/hooks/useMyBadgesQuery";
import type { BadgeType, MyBadge } from "@/features/my/types/myBadge.types";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

const badgeDisplayTitles: Record<BadgeType, string> = {
  FIRST_COMPLETION: "첫 발걸음",
  BOOKMARK_5: "내 취향 찾기",
  FIRST_TEAM_JOIN: "같이 해요!",
  FIRST_REVIEW: "따뜻한 후기",
  COMMENT_10: "경험 나누기",
  COMPLETION_5: "참여 완료!",
  CONSECUTIVE_3_MONTHS: "꾸준한 마음",
  TEAM_CREATED: "우리 팀 만들기",
};
const badgeIcons: Record<BadgeType, string> = {
  FIRST_COMPLETION: firstCompletionIcon,
  BOOKMARK_5: bookmark5Icon,
  FIRST_TEAM_JOIN: firstTeamJoinIcon,
  FIRST_REVIEW: firstReviewIcon,
  COMMENT_10: comment10Icon,
  COMPLETION_5: completion5Icon,
  CONSECUTIVE_3_MONTHS: consecutive3MonthsIcon,
  TEAM_CREATED: teamCreatedIcon,
};

function percentage(currentValue: number, targetValue: number) {
  if (targetValue <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((currentValue / targetValue) * 100)),
  );
}

function BadgeIcon({ badge }: { badge: MyBadge }) {
  return (
    <img
      src={badge.earned ? badgeIcons[badge.badgeType] : lockIcon}
      alt=""
      className="size-8"
    />
  );
}

function BadgeCard({ badge }: { badge: MyBadge }) {
  const progress = percentage(badge.currentValue, badge.targetValue);

  return (
    <article
      className={`flex h-[168px] flex-col items-center rounded-[20px] border border-stroke bg-white p-[17px] text-center ${badge.earned ? "" : "opacity-60"}`}
    >
      <div
        className={`flex size-14 items-center justify-center rounded-full ${badge.earned ? "bg-[rgba(144,215,157,0.19)]" : "bg-[#f5f5f5]"}`}
        aria-hidden="true"
      >
        <BadgeIcon badge={badge} />
      </div>
      <h2 className="mt-3 flex h-5 w-[134px] items-center justify-center text-[16px] leading-5 font-semibold text-text">
        {badgeDisplayTitles[badge.badgeType]}
      </h2>
      <p
        title={badge.title}
        className="mt-1 flex h-4 w-[134px] items-center justify-center truncate text-[15px] leading-[13.75px] text-text-gray-400"
      >
        {badge.title}
      </p>

      {badge.earned ? (
        <p className="mt-1 flex h-[21px] w-[134px] items-center justify-center text-[12px] leading-[15px] font-medium text-point-green">
          {badge.earnedAt
            ? `${badge.earnedAt.slice(0, 10).replaceAll("-", ".")} 획득`
            : "획득 완료"}
        </p>
      ) : (
        <div
          className="mt-1 flex h-[21px] w-full items-center"
          aria-label={`${badge.currentValue}/${badge.targetValue} 달성`}
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#ececec]">
            <div
              className="h-full rounded-full bg-[#b5e4bd]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}

export function MyBadgesScreen() {
  const navigate = useNavigate();
  const badgesQuery = useMyBadgesQuery();
  const badges = badgesQuery.data ?? [];
  const earnedCount = badges.filter((badge) => badge.earned).length;
  const overallProgress = percentage(earnedCount, badges.length);

  return (
    <main className="mx-auto min-h-dvh max-w-app bg-bg px-5.5 pb-8">
      <PageHeader title="활동 뱃지" onBack={() => navigate(-1)} />

      {badgesQuery.isPending ? (
        <LoadingState
          label="활동 뱃지를 불러오는 중이에요."
          className="min-h-80"
        />
      ) : badgesQuery.isError ? (
        <ErrorState
          title="활동 뱃지를 불러오지 못했어요."
          description="잠시 후 다시 시도해 주세요."
          className="min-h-80 justify-center"
          primaryAction={{
            label: "다시 시도",
            onClick: () => void badgesQuery.refetch(),
          }}
        />
      ) : (
        <>
          <section className="mt-4 flex items-center gap-4 rounded-[20px] bg-[#dcecdf] py-4 pr-10 pl-4">
            <div className="flex size-[63px] shrink-0 items-center justify-center rounded-full bg-white">
              <img src={activityBadgeIcon} alt="" className="size-6" />
            </div>
            <div>
              <p className="text-body-16 font-medium text-text">획득한 뱃지</p>
              <p className="text-[22px] leading-[33px] font-semibold text-text">
                {earnedCount} / {badges.length}개
              </p>
              <p className="mt-1 text-body-14 font-medium text-text-gray-200">
                더 많은 활동으로 뱃지를 모아보세요!
              </p>
            </div>
          </section>

          <section className="mt-6" aria-label="전체 달성률">
            <div className="flex h-5 items-center justify-between text-[16px] leading-[19.5px] font-medium">
              <span className="text-text">전체 달성률</span>
              <span className="text-point-green">{overallProgress}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eeeeec]">
              <div
                className="h-full rounded-full bg-[#b5e4bd]"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </section>

          <section
            className="mt-6 grid grid-cols-2 gap-x-5.5 gap-y-3"
            aria-label="활동 뱃지 목록"
          >
            {badges.map((badge) => (
              <BadgeCard key={badge.badgeType} badge={badge} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

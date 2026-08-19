import { useNavigate } from "react-router";

import alarmIcon from "@/assets/icons/Alarm.svg";
import arrowIcon from "@/assets/icons/Arrow.svg";
import gatherIcon from "@/assets/volunteer/Gather.svg";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useUnreadNotificationCountQuery } from "@/features/notification/hooks/useUnreadNotificationCountQuery";
import { TeamCard } from "@/features/team/components/TeamCard";
import { VolunteerPostingCard } from "@/features/volunteer/components/VolunteerPostingCard";
import { useRecommendedMeetingsQuery } from "@/features/team/hooks/useRecommendedMeetingsQuery";
import { useRecommendedVolunteerPostingsQuery } from "@/features/volunteer/hooks/useRecommendedVolunteerPostingsQuery";
import IconButton from "@/shared/ui/IconButton";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";

type HomeSectionStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  onRetry: () => void;
};

function HomeSectionState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  onRetry,
}: HomeSectionStateProps) {
  if (isLoading) {
    return <LoadingState className="h-40" label="불러오는 중" />;
  }

  if (isError) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-text-gray-400">
        <p>목록을 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg px-3 py-2 font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <p className="flex h-40 items-center justify-center text-sm text-text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return null;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const unreadCountQuery = useUnreadNotificationCountQuery(
    authInitialized && isAuthenticated,
  );
  const postingsQuery = useRecommendedVolunteerPostingsQuery();
  const meetingsQuery = useRecommendedMeetingsQuery();

  const postings = postingsQuery.data ?? [];
  const meetings = meetingsQuery.data ?? [];
  const isPostingsInitialError =
    postingsQuery.isError && postingsQuery.data === undefined;
  const isMeetingsInitialError =
    meetingsQuery.isError && meetingsQuery.data === undefined;
  const unreadTotal = unreadCountQuery.data?.total ?? 0;
  const unreadBadgeLabel = unreadTotal > 99 ? "99+" : String(unreadTotal);
  const isPostingsLoading = !authInitialized || postingsQuery.isLoading;
  const isMeetingsLoading = !authInitialized || meetingsQuery.isLoading;
  return (
    <PageContainer size="narrow">
      <header className="flex h-[calc(70px+env(safe-area-inset-top))] items-center justify-between pt-[env(safe-area-inset-top)]">
        <img src={gatherIcon} alt="Gather" className="h-14 w-auto" />
        <div className="mr-[11px] flex items-center gap-5">
          <div className="flex size-[27px] items-center justify-center">
            <IconButton
              label="알림 확인"
              icon={
                <span className="relative flex size-[27px] items-center justify-center">
                  <img src={alarmIcon} alt="" className="h-5 w-[18px]" />

                  {unreadTotal > 0 ? (
                    <span className="pointer-events-none absolute top-0 right-[3px] flex h-3 min-w-3 items-center justify-center rounded-[7px] bg-point-red px-0.5 text-[8px] leading-none text-white">
                      {unreadBadgeLabel}
                    </span>
                  ) : null}
                </span>
              }
              size="medium"
              className="size-[27px]"
              onClick={() => navigate("/notifications")}
            />
          </div>
        </div>
      </header>

      <div className="pt-6 pb-12">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold leading-7">
              이번 주, 내 주변에선 뭐하지? 👀
            </h2>
            <IconButton
              label="봉사 공고 전체 보기"
              icon={<img src={arrowIcon} alt="" />}
              size="medium"
              className="-m-3 [&>span>img]:size-8"
              onClick={() => navigate("/volunteers")}
            />
          </div>

          <div className="flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pr-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HomeSectionState
              isLoading={isPostingsLoading}
              isError={isPostingsInitialError}
              isEmpty={
                authInitialized &&
                !isPostingsLoading &&
                !isPostingsInitialError &&
                postings.length === 0
              }
              emptyMessage="표시할 봉사 공고가 없어요."
              onRetry={() => {
                void postingsQuery.refetch();
              }}
            />
            {postings.map((posting) => (
              <VolunteerPostingCard
                key={posting.id}
                variant="compact"
                posting={posting}
                onClick={() => navigate(`/volunteers/${posting.id}`)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mt-14 mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold leading-7">
              같이 갈 사람 찾는 중 🙌
            </h2>
            <IconButton
              label="모임 공고 전체 보기"
              icon={<img src={arrowIcon} alt="" />}
              size="medium"
              className="-m-3 [&>span>img]:size-8"
              onClick={() => navigate("/teams?tab=find")}
            />
          </div>

          <div className="flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pr-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HomeSectionState
              isLoading={isMeetingsLoading}
              isError={isMeetingsInitialError}
              isEmpty={
                authInitialized &&
                !isMeetingsLoading &&
                !isMeetingsInitialError &&
                meetings.length === 0
              }
              emptyMessage="표시할 모임이 없어요."
              onRetry={() => {
                void meetingsQuery.refetch();
              }}
            />
            {meetings.map((meeting) => (
              <TeamCard
                key={meeting.meetingId}
                variant="compact"
                team={meeting}
                onClick={() => navigate(`/teams/${meeting.meetingId}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";

import alarmIcon from "@/assets/icons/Alarm.svg";
import arrowIcon from "@/assets/icons/Arrow.svg";
import filterIcon from "@/assets/icons/Filter.svg";
import { TeamCard } from "@/features/team/components/TeamCard";
import { useMeetingsQuery } from "@/features/team/hooks/useMeetingsQuery";
import { VolunteerPostingCard } from "@/features/volunteer/components/VolunteerPostingCard";
import { VolunteerPostingFilterSheet } from "@/features/volunteer/components/filter/VolunteerPostingFilterSheet";
import { useVolunteerPostingsQuery } from "@/features/volunteer/hooks/useVolunteerPostingsQuery";
import { updateVolunteerPostingSearchParams } from "@/features/volunteer/lib/volunteerPostingSearchParams";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const postingsQuery = useVolunteerPostingsQuery({
    page: 0,
    size: 5,
    sort: ["actStartDate,asc"],
  });
  const meetingsQuery = useMeetingsQuery();
  const postings = postingsQuery.data?.content ?? [];
  const meetings = (meetingsQuery.data ?? []).slice(0, 5);

  return (
    <PageContainer size="narrow">
      <header className="flex items-center justify-between pb-10 pt-8">
        <h1 className="text-[34px] font-bold tracking-tight text-[#316B43]">
          Gather
        </h1>

        <div className="flex items-center gap-4">
          <IconButton
            label="필터 열기"
            icon={<img src={filterIcon} alt="" />}
            size="medium"
            className="-m-3"
            onClick={() => setIsFilterOpen(true)}
          />

          <div className="relative">
            <IconButton
              label="알림 확인"
              icon={<img src={alarmIcon} alt="" />}
              size="medium"
              className="-m-3"
              onClick={() => navigate("/notifications")}
            />

            <span className="pointer-events-none absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
              2
            </span>
          </div>
        </div>
      </header>

      <div>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
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

          <div className="-mr-5.5 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pr-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HomeSectionState
              isLoading={postingsQuery.isLoading}
              isError={postingsQuery.isError}
              isEmpty={
                !postingsQuery.isLoading &&
                !postingsQuery.isError &&
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

        <div className="-mx-5.5 my-7 h-2 bg-gray-100" />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">같이 갈 사람 찾는 중 🙌</h2>
            <IconButton
              label="모임 공고 전체 보기"
              icon={<img src={arrowIcon} alt="" />}
              size="medium"
              className="-m-3 [&>span>img]:size-8"
              onClick={() => navigate("/teams")}
            />
          </div>

          <div className="-mr-5.5 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pr-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HomeSectionState
              isLoading={meetingsQuery.isLoading}
              isError={meetingsQuery.isError}
              isEmpty={
                !meetingsQuery.isLoading &&
                !meetingsQuery.isError &&
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
      {isFilterOpen ? (
        <VolunteerPostingFilterSheet
          open
          onOpenChange={setIsFilterOpen}
          filter={{}}
          onApply={(filter) => {
            const query = updateVolunteerPostingSearchParams(
              new URLSearchParams(),
              filter,
            ).toString();
            navigate(query ? `/volunteers?${query}` : "/volunteers");
          }}
        />
      ) : null}
    </PageContainer>
  );
}

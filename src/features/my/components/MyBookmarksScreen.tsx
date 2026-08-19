import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import { useInfiniteBookmarkedMeetingsQuery } from "@/features/team/hooks/useInfiniteBookmarkedMeetingsQuery";
import { TeamCard } from "@/features/team/components/TeamCard";
import { TeamFilterSheet } from "@/features/team/components/TeamFilterSheet";
import {
  getTeamListFilter,
  updateTeamListSearchParams,
} from "@/features/team/lib/teamListSearchParams";
import { useInfiniteBookmarkedVolunteerPostingsQuery } from "@/features/volunteer/hooks/useInfiniteBookmarkedVolunteerPostingsQuery";
import { VolunteerPostingCard } from "@/features/volunteer/components/VolunteerPostingCard";
import { VolunteerPostingFilterSheet } from "@/features/volunteer/components/filter/VolunteerPostingFilterSheet";
import {
  getVolunteerPostingFilter,
  updateVolunteerPostingSearchParams,
} from "@/features/volunteer/lib/volunteerPostingSearchParams";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import IconButton from "@/shared/ui/IconButton";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

type BookmarkTab = "postings" | "meetings";
const TABS: Array<{ value: BookmarkTab; label: string }> = [
  { value: "postings", label: "봉사 공고" },
  { value: "meetings", label: "관심 모임" },
];

export function MyBookmarksScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const selectedTab =
    searchParams.get("tab") === "meetings" ? "meetings" : "postings";
  const postingFilter = useMemo(
    () => getVolunteerPostingFilter(searchParams),
    [searchParams],
  );
  const meetingFilter = useMemo(
    () => getTeamListFilter(searchParams),
    [searchParams],
  );
  const postingsQuery = useInfiniteBookmarkedVolunteerPostingsQuery(
    postingFilter,
    selectedTab === "postings",
  );
  const meetingsQuery = useInfiniteBookmarkedMeetingsQuery(
    meetingFilter,
    selectedTab === "meetings",
  );
  const postings =
    postingsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const meetings =
    meetingsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const activeIsPending =
    selectedTab === "postings"
      ? postingsQuery.isPending
      : meetingsQuery.isPending;
  const activeIsInitialError =
    selectedTab === "postings"
      ? postingsQuery.isError && postings.length === 0
      : meetingsQuery.isError && meetings.length === 0;
  const activeHasNextPage =
    selectedTab === "postings"
      ? postingsQuery.hasNextPage
      : meetingsQuery.hasNextPage;
  const activeIsFetchingNextPage =
    selectedTab === "postings"
      ? postingsQuery.isFetchingNextPage
      : meetingsQuery.isFetchingNextPage;
  const activeIsFetchNextPageError =
    selectedTab === "postings"
      ? postingsQuery.isFetchNextPageError
      : meetingsQuery.isFetchNextPageError;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          activeHasNextPage &&
          !activeIsFetchingNextPage
        ) {
          if (selectedTab === "postings") {
            void postingsQuery.fetchNextPage();
          } else {
            void meetingsQuery.fetchNextPage();
          }
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    activeHasNextPage,
    activeIsFetchingNextPage,
    meetingsQuery,
    postingsQuery,
    selectedTab,
  ]);

  const retryActiveQuery = () => {
    if (selectedTab === "postings") {
      void postingsQuery.refetch();
    } else {
      void meetingsQuery.refetch();
    }
  };

  const retryNextPage = () => {
    if (selectedTab === "postings") {
      void postingsQuery.fetchNextPage();
    } else {
      void meetingsQuery.fetchNextPage();
    }
  };

  const activeIsEmpty =
    selectedTab === "postings" ? postings.length === 0 : meetings.length === 0;
  const initialState = activeIsPending ? (
    <LoadingState label="찜한 활동을 불러오는 중" />
  ) : activeIsInitialError ? (
    <ErrorState
      title="찜한 활동을 불러오지 못했어요"
      description="잠시 후 다시 확인해 주세요."
      primaryAction={{ label: "다시 시도", onClick: retryActiveQuery }}
    />
  ) : activeIsEmpty ? (
    selectedTab === "postings" ? (
      <EmptyState title="찜한 봉사 공고가 없어요" />
    ) : (
      <EmptyState title="찜한 모임이 없어요" />
    )
  ) : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-app flex-col bg-bg">
      <div className="px-5.5">
        <PageHeader
          title="찜한 활동"
          onBack={() => navigate(-1)}
          rightAction={
            <div className="flex items-center gap-1">
              <IconButton
                label="필터 열기"
                icon={<img src={filterIcon} alt="" />}
                onClick={() => setIsFilterOpen(true)}
              />
              <IconButton
                label={
                  selectedTab === "postings" ? "봉사 공고 검색" : "모임 검색"
                }
                icon={<img src={searchIcon} alt="" />}
                className="[&>span>img]:size-[27px]"
                onClick={() =>
                  navigate(
                    selectedTab === "postings"
                      ? "/volunteers/search"
                      : "/teams/search",
                  )
                }
              />
            </div>
          }
        />
      </div>
      <nav className="grid grid-cols-2" aria-label="찜한 활동 유형">
        {TABS.map((tab) => {
          const selected = selectedTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() =>
                setSearchParams({ tab: tab.value }, { replace: true })
              }
              className={[
                "h-12 border-b text-base",
                selected
                  ? "border-b-2 border-text font-semibold text-text"
                  : "border-stroke font-medium text-text-gray-400",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <main className="flex flex-1 flex-col space-y-3 px-5.5 py-5">
        {initialState ? (
          <div className="flex min-h-55 flex-1 flex-col justify-center">
            {initialState}
          </div>
        ) : (
          <>
            {selectedTab === "postings"
              ? postings.map((posting) => (
                  <VolunteerPostingCard
                    key={posting.id}
                    posting={posting}
                    onClick={() => navigate(`/volunteers/${posting.id}`)}
                  />
                ))
              : meetings.map((meeting) => (
                  <TeamCard
                    key={meeting.meetingId}
                    team={meeting}
                    onClick={() => navigate(`/teams/${meeting.meetingId}`)}
                  />
                ))}

            {!activeIsPending && !activeIsInitialError ? (
              <>
                {activeIsFetchingNextPage ? (
                  <LoadingState
                    label="다음 활동을 불러오는 중"
                    className="min-h-20"
                  />
                ) : null}
                {activeIsFetchNextPageError ? (
                  <button
                    type="button"
                    onClick={retryNextPage}
                    className="w-full py-4 text-center text-body-14 text-text-gray-400"
                  >
                    추가 활동을 불러오지 못했어요. 다시 시도
                  </button>
                ) : null}
                <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
              </>
            ) : null}
          </>
        )}
      </main>
      {isFilterOpen && selectedTab === "postings" ? (
        <VolunteerPostingFilterSheet
          key={searchParams.toString()}
          open
          onOpenChange={setIsFilterOpen}
          filter={postingFilter}
          onApply={(nextFilter) =>
            setSearchParams(
              updateVolunteerPostingSearchParams(searchParams, nextFilter),
              { replace: true },
            )
          }
        />
      ) : null}
      {isFilterOpen && selectedTab === "meetings" ? (
        <TeamFilterSheet
          key={searchParams.toString()}
          open
          onOpenChange={setIsFilterOpen}
          filter={meetingFilter}
          onApply={(nextFilter) =>
            setSearchParams(
              updateTeamListSearchParams(searchParams, nextFilter),
              { replace: true },
            )
          }
        />
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import plusIcon from "@/assets/icons/Plus.svg";
import searchIcon from "@/assets/icons/Search.svg";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  isTeamListSort,
  teamListSortOptions,
} from "@/features/team/constants/teamList.constants";
import { useInfiniteMeetingsQuery } from "@/features/team/hooks/useInfiniteMeetingsQuery";
import { useMyMeetingsQuery } from "@/features/team/hooks/useMyMeetingsQuery";
import {
  getTeamListFilter,
  getTeamListSort,
  toTeamListQueryParams,
  updateTeamListSearchParams,
} from "@/features/team/lib/teamListSearchParams";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import IconButton from "@/shared/ui/IconButton";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import {
  SCROLL_TOP_BUTTON_THRESHOLD_INDEX,
  ScrollTopButton,
} from "@/shared/ui/ScrollTopButton";
import Select from "@/shared/ui/Select";
import { cn } from "@/shared/lib/cn";

import { TeamCard } from "./TeamCard";
import type { TeamFilter } from "@/features/team/types/teamFilter.types";

import { TeamFilterSheet } from "./TeamFilterSheet";

type TeamListTab = "my" | "find";

function TeamListTabs({
  activeTab,
  onChange,
}: {
  activeTab: TeamListTab;
  onChange: (tab: TeamListTab) => void;
}) {
  const tabs: ReadonlyArray<{ value: TeamListTab; label: string }> = [
    { value: "my", label: "우리 모임" },
    { value: "find", label: "모임 찾기" },
  ];

  return (
    <div className="-mx-5.5 grid h-12 grid-cols-2 border-b border-stroke">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
              isActive ? "font-semibold text-text" : "text-text-gray-400",
            )}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {isActive ? (
              <span
                className="absolute inset-x-0 bottom-[-1px] h-px bg-text"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function MyMeetingList({ enabled }: { enabled: boolean }) {
  const meetingsQuery = useMyMeetingsQuery({ enabled });
  const regionsQuery = useRegionsQuery();
  const regionNameById = useMemo(
    () =>
      new Map(
        (regionsQuery.data ?? []).map((region) => [region.id, region.name]),
      ),
    [regionsQuery.data],
  );
  const navigate = useNavigate();

  if (meetingsQuery.isLoading) {
    return (
      <LoadingState label="우리 모임을 불러오는 중" className="min-h-55" />
    );
  }

  if (meetingsQuery.isError) {
    return (
      <ErrorState
        title="우리 모임을 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => {
            void meetingsQuery.refetch();
          },
        }}
      />
    );
  }

  const meetings = [...(meetingsQuery.data ?? [])].sort((left, right) => {
    if (left.viewerRole === right.viewerRole) {
      return 0;
    }

    return left.viewerRole === "HOST" ? -1 : 1;
  });

  if (meetings.length === 0) {
    return (
      <EmptyState
        title="아직 참여한 모임이 없어요"
        description="마음에 드는 모임을 찾아 참여해 보세요."
      />
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {meetings.map((team) => (
        <li key={team.meetingId}>
          <TeamCard
            team={team}
            variant="my"
            viewerRole={team.viewerRole}
            regionName={regionNameById.get(team.regionId) ?? null}
            onClick={() => navigate(`/teams/${team.meetingId}/posts`)}
          />
        </li>
      ))}
    </ul>
  );
}

function MeetingDiscoverList({
  searchParams,
  setSearchParams,
  isAuthenticated,
  isFilterOpen,
  setIsFilterOpen,
}: {
  searchParams: URLSearchParams;
  setSearchParams: (nextInit: URLSearchParams) => void;
  isAuthenticated: boolean;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const topButtonThresholdRef = useRef<HTMLLIElement>(null);
  const regionsQuery = useRegionsQuery();
  const sort = getTeamListSort(searchParams);
  const filter = useMemo<TeamFilter>(
    () => getTeamListFilter(searchParams),
    [searchParams],
  );
  const queryParams = useMemo(
    () => toTeamListQueryParams(searchParams),
    [searchParams],
  );
  const meetingsQuery = useInfiniteMeetingsQuery(queryParams);
  const meetings =
    meetingsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const regionNameById = useMemo(
    () =>
      new Map(
        (regionsQuery.data ?? []).map((region) => [region.id, region.name]),
      ),
    [regionsQuery.data],
  );

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          meetingsQuery.hasNextPage &&
          !meetingsQuery.isFetchingNextPage &&
          !meetingsQuery.isFetchNextPageError
        ) {
          void meetingsQuery.fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [meetingsQuery]);

  return (
    <>
      <div className="flex h-[60px] items-center justify-between">
        <h1 className="text-title-18">같이 갈 사람 찾는 중 🙌</h1>
        <Select
          ariaLabel="모임 정렬"
          value={sort}
          options={teamListSortOptions}
          contentClassName="w-[206px]"
          onChange={(value) => {
            if (!isTeamListSort(value)) return;
            setSearchParams(
              updateTeamListSearchParams(searchParams, filter, {
                sort: value,
              }),
            );
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        />
      </div>

      {meetingsQuery.isLoading ? (
        <LoadingState label="모임을 불러오는 중" className="min-h-55" />
      ) : null}

      {meetingsQuery.isError ? (
        <ErrorState
          title="모임을 불러오지 못했어요"
          description="잠시 후 다시 확인해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void meetingsQuery.refetch();
            },
          }}
        />
      ) : null}

      {!meetingsQuery.isLoading &&
      !meetingsQuery.isError &&
      meetings.length === 0 ? (
        <EmptyState
          title="조건에 맞는 모임이 없어요"
          description="검색어나 필터 조건을 바꿔 다시 확인해 주세요."
        />
      ) : null}

      {meetings.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {meetings.map((team, index) => (
            <li
              key={team.meetingId}
              ref={
                index === SCROLL_TOP_BUTTON_THRESHOLD_INDEX
                  ? topButtonThresholdRef
                  : undefined
              }
            >
              <TeamCard
                team={team}
                regionName={regionNameById.get(team.regionId) ?? null}
                onClick={() => navigate(`/teams/${team.meetingId}`)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {meetings.length > 0 ? (
        <>
          <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
          {meetingsQuery.isFetchingNextPage ? (
            <LoadingState label="모임을 더 불러오는 중" className="min-h-24" />
          ) : null}
          {meetingsQuery.isFetchNextPageError ? (
            <div className="py-6 text-center">
              <p className="text-sm text-text-gray-400">
                모임을 더 불러오지 못했어요.
              </p>
              <button
                type="button"
                className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() => void meetingsQuery.fetchNextPage()}
              >
                다시 시도
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => navigate("/teams/new")}
          className="fixed right-[max(1.375rem,calc(50%-12.5625rem+1.375rem))] bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 flex h-12 items-center gap-2 rounded-full bg-button px-5 text-lg font-medium text-text2 shadow-sm active:bg-icon focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        >
          <img src={plusIcon} alt="" className="size-5" />
          모임 만들기
        </button>
      ) : null}

      <ScrollTopButton
        itemCount={meetings.length}
        thresholdRef={topButtonThresholdRef}
        className="bottom-[calc(9.5rem+env(safe-area-inset-bottom))]"
      />

      {isFilterOpen ? (
        <TeamFilterSheet
          key={searchParams.toString()}
          open
          onOpenChange={setIsFilterOpen}
          filter={filter}
          onApply={(nextFilter) => {
            setSearchParams(
              updateTeamListSearchParams(searchParams, nextFilter),
            );
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        />
      ) : null}
    </>
  );
}

export function TeamListScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!authInitialized) {
    return (
      <PageContainer size="narrow" className="min-h-dvh pb-28">
        <PageHeader
          title="모임"
          onBack={() => navigate(-1)}
          className="[&>div]:h-[70px]"
        />
        <LoadingState
          label="로그인 정보를 확인하고 있습니다."
          className="min-h-55"
        />
      </PageContainer>
    );
  }

  const tabParam = searchParams.get("tab");

  if (!isAuthenticated && tabParam === "my") {
    return <Navigate to="/login" replace state={{ from: "/teams?tab=my" }} />;
  }

  const activeTab: TeamListTab =
    tabParam === "my" || tabParam === "find"
      ? tabParam
      : isAuthenticated
        ? "my"
        : "find";
  const changeTab = (tab: TeamListTab) => {
    if (tab === "my" && !isAuthenticated) {
      navigate("/login", { state: { from: "/teams?tab=my" } });
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
    setIsFilterOpen(false);
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-28">
      <PageHeader
        title="모임"
        onBack={() => navigate(-1)}
        className="[&>div]:h-[70px]"
        rightAction={
          activeTab === "find" ? (
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <IconButton
                label="필터 열기"
                icon={<img src={filterIcon} alt="" />}
                size="medium"
                className="-m-3"
                onClick={() => setIsFilterOpen(true)}
              />
              <IconButton
                label="모임 검색"
                icon={<img src={searchIcon} alt="" />}
                size="medium"
                className="-m-3"
                onClick={() => navigate("/teams/search")}
              />
            </div>
          ) : undefined
        }
      />

      <TeamListTabs activeTab={activeTab} onChange={changeTab} />

      {activeTab === "my" ? (
        <MyMeetingList enabled={authInitialized && isAuthenticated} />
      ) : null}
      {activeTab === "find" ? (
        <MeetingDiscoverList
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          isAuthenticated={isAuthenticated}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
      ) : null}
    </PageContainer>
  );
}

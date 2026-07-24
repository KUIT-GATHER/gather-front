import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import plusIcon from "@/assets/icons/Plus.svg";
import searchIcon from "@/assets/icons/Search.svg";
import sortIcon from "@/assets/icons/Sort.svg";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";
import { useInfiniteMeetingsQuery } from "@/features/team/hooks/useInfiniteMeetingsQuery";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import type { MeetingInfiniteParams, MeetingStatus } from "../types/team.types";
import { TeamCard } from "./TeamCard";

function toPositiveNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function toMeetingStatus(value: string | null): MeetingStatus | undefined {
  return value === "RECRUITING" || value === "CLOSED" || value === "COMPLETED"
    ? value
    : undefined;
}

function toPostingCategory(value: string | null) {
  return value &&
    POSTING_CATEGORIES.includes(value as (typeof POSTING_CATEGORIES)[number])
    ? (value as (typeof POSTING_CATEGORIES)[number])
    : undefined;
}

export function TeamListScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const regionsQuery = useRegionsQuery();
  const queryParams = useMemo<MeetingInfiniteParams>(
    () => ({
      keyword: searchParams.get("keyword")?.trim() || undefined,
      regionId: toPositiveNumber(searchParams.get("regionId")),
      category: toPostingCategory(searchParams.get("category")),
      status: toMeetingStatus(searchParams.get("status")),
      size: 10,
      sort: ["createdAt,desc"],
    }),
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
    <PageContainer size="narrow" className="min-h-dvh pb-28">
      <PageHeader
        title="모임"
        onBack={() => navigate(-1)}
        className="[&>div]:h-[70px]"
        rightAction={
          <div className="ml-3 flex shrink-0 items-center gap-2">
            <IconButton
              disabled
              label="필터 열기"
              icon={<img src={filterIcon} alt="" />}
              size="medium"
              className="-m-3 disabled:opacity-100"
            />
            <IconButton
              label="모임 검색"
              icon={<img src={searchIcon} alt="" />}
              size="medium"
              className="-m-3"
              onClick={() => navigate("/teams/search")}
            />
          </div>
        }
      />

      <div className="-mx-5.5 grid h-12 grid-cols-2 border-b border-stroke">
        <button
          type="button"
          disabled
          className="text-base font-medium text-text-gray-400 disabled:opacity-100"
        >
          우리 모임
        </button>
        <button
          type="button"
          aria-current="page"
          className="relative text-base font-semibold text-text after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-text"
        >
          모임 찾기
        </button>
      </div>

      <div className="flex h-[60px] items-center justify-between">
        <h1 className="text-title-18">같이 갈 사람 찾는 중 🙌</h1>
        <div className="flex items-center gap-2 text-sm text-text">
          <img src={sortIcon} alt="" className="size-[15px]" />
          <span>최신순</span>
        </div>
      </div>

      {meetingsQuery.isLoading ? (
        <LoadingState label="모임을 불러오는 중" className="min-h-55" />
      ) : null}

      {meetingsQuery.isError ? (
        <ErrorState
          title="모임을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
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
        <ul className="flex flex-col gap-2">
          {meetings.map((team) => (
            <li key={team.meetingId}>
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

      <button
        type="button"
        onClick={() => navigate("/teams/new")}
        className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-[calc(50%+27px)] z-20 flex h-12 items-center gap-2 rounded-full bg-button px-5 text-lg font-medium text-text2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <img src={plusIcon} alt="" className="size-5" />
        모임 만들기
      </button>
    </PageContainer>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select from "@/shared/ui/Select";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import {
  isVolunteerPostingListSort,
  volunteerPostingListSortOptions,
  VOLUNTEER_POSTING_SORT_PARAMS,
} from "../../constants/volunteerPostingList.constants";
import { useInfiniteVolunteerPostingsQuery } from "../../hooks/useInfiniteVolunteerPostingsQuery";
import type {
  VolunteerPostingInfiniteParams,
  VolunteerPostingStatus,
} from "../../types/volunteer.types";
import type { VolunteerPostingListSort } from "../../constants/volunteerPostingList.constants";
import { VolunteerPostingCard } from "../VolunteerPostingCard";

const PAGE_SIZE = 10;

function toPositiveNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function toVolunteerPostingStatus(
  value: string | null,
): VolunteerPostingStatus | undefined {
  return value === "RECRUITING" || value === "CLOSED" || value === "COMPLETED"
    ? value
    : undefined;
}

export function VolunteerPostingListScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortType, setSortType] = useState<VolunteerPostingListSort>("latest");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const queryParams = useMemo<VolunteerPostingInfiniteParams>(() => {
    const baseParams = {
      size: PAGE_SIZE,
      sort: VOLUNTEER_POSTING_SORT_PARAMS[sortType],
      status: toVolunteerPostingStatus(searchParams.get("status")),
      keyword: searchParams.get("keyword")?.trim() || undefined,
      noticeStartDate: searchParams.get("noticeStartDate") || undefined,
      noticeEndDate: searchParams.get("noticeEndDate") || undefined,
    };
    const regionId = toPositiveNumber(searchParams.get("regionId"));
    const regionGroupId = toPositiveNumber(searchParams.get("regionGroupId"));

    if (regionId !== undefined) {
      return { ...baseParams, regionId };
    }

    if (regionGroupId !== undefined) {
      return { ...baseParams, regionGroupId };
    }

    return baseParams;
  }, [searchParams, sortType]);
  const postingsQuery = useInfiniteVolunteerPostingsQuery(queryParams);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    refetch,
  } = postingsQuery;
  const postings = data?.pages.flatMap((page) => page.content) ?? [];
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetchNextPageError
        ) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  const handleSortChange = (value: string) => {
    if (!isVolunteerPostingListSort(value)) {
      return;
    }

    setSortType(value);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const isInitialLoading = isLoading && postings.length === 0;
  const isInitialError = isError && postings.length === 0;

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <PageHeader
        sticky
        title="이번주, 내 주변에선 뭐하지?"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="ml-4 flex shrink-0 items-center gap-4">
            <IconButton
              disabled
              label="필터 열기"
              icon={<img src={filterIcon} alt="" />}
              size="medium"
              className="-m-3 disabled:opacity-100"
            />
            <IconButton
              label="봉사 공고 검색"
              icon={<img src={searchIcon} alt="" />}
              size="medium"
              className="-m-3"
              onClick={() => navigate("/volunteers/search")}
            />
          </div>
        }
      />

      <div className="mt-7 flex items-center justify-between pb-4">
        <p className="text-sm text-gray-700">전체 {totalElements}개 활동</p>
        <Select
          ariaLabel="봉사 공고 정렬"
          value={sortType}
          onChange={handleSortChange}
          options={volunteerPostingListSortOptions}
        />
      </div>

      {isInitialLoading ? (
        <LoadingState label="봉사 공고를 불러오는 중" className="min-h-55" />
      ) : null}

      {isInitialError ? (
        <ErrorState
          title="봉사 공고를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void refetch();
            },
          }}
        />
      ) : null}

      {isSuccess && postings.length === 0 ? (
        <EmptyState
          title="조건에 맞는 봉사 공고가 없어요"
          description="검색어나 필터 조건을 바꿔 다시 확인해 주세요."
        />
      ) : null}

      {postings.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {postings.map((posting) => (
              <li key={posting.id}>
                <VolunteerPostingCard
                  posting={posting}
                  onClick={() => navigate(`/volunteers/${posting.id}`)}
                />
              </li>
            ))}
          </ul>

          <div ref={loadMoreRef} aria-hidden="true" className="h-1" />

          {isFetchingNextPage ? (
            <LoadingState
              label="봉사 공고를 더 불러오는 중"
              className="min-h-24"
            />
          ) : null}

          {isFetchNextPageError ? (
            <div className="py-6 text-center">
              <p className="text-sm text-text-gray-400">
                봉사 공고를 더 불러오지 못했어요.
              </p>
              <button
                type="button"
                className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() => {
                  void fetchNextPage();
                }}
              >
                다시 시도
              </button>
            </div>
          ) : null}

          {!isFetchingNextPage && !isFetchNextPageError && !hasNextPage ? (
            <p className="py-6 text-center text-sm text-text-gray-100">
              모든 봉사 공고를 확인했어요.
            </p>
          ) : null}
        </>
      ) : null}
    </PageContainer>
  );
}

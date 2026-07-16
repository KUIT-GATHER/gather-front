import { useMemo, useState } from "react";
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
} from "../constants/volunteerPostingList.constants";
import { useVolunteerPostingsQuery } from "../hooks/useVolunteerPostingsQuery";
import type {
  VolunteerPostingListParams,
  VolunteerPostingStatus,
} from "../types/volunteer.types";
import type { VolunteerPostingListSort } from "../constants/volunteerPostingList.constants";
import { VolunteerPostingCard } from "./VolunteerPostingCard";

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(0);

  const queryParams = useMemo<VolunteerPostingListParams>(() => {
    const baseParams = {
      page,
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
  }, [page, searchParams, sortType]);
  const postingsQuery = useVolunteerPostingsQuery(queryParams);
  const postingsPage = postingsQuery.data;

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
        <p className="text-sm text-gray-700">
          전체 {postingsPage?.totalElements ?? 0}개 활동
        </p>
        <Select
          ariaLabel="봉사 공고 정렬"
          value={sortType}
          onChange={(value) => {
            if (isVolunteerPostingListSort(value)) {
              setSortType(value);
              setPage(0);
            }
          }}
          options={volunteerPostingListSortOptions}
        />
      </div>

      {postingsQuery.isLoading ? (
        <LoadingState label="봉사 공고를 불러오는 중" className="min-h-55" />
      ) : null}

      {postingsQuery.isError ? (
        <ErrorState
          title="봉사 공고를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void postingsQuery.refetch();
            },
          }}
        />
      ) : null}

      {postingsPage && postingsPage.content.length === 0 ? (
        <EmptyState
          title="조건에 맞는 봉사 공고가 없어요"
          description="검색어나 필터 조건을 바꿔 다시 확인해 주세요."
        />
      ) : null}

      {postingsPage && postingsPage.content.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {postingsPage.content.map((posting) => (
              <li key={posting.id}>
                <VolunteerPostingCard
                  posting={posting}
                  onClick={() => navigate(`/volunteers/${posting.id}`)}
                />
              </li>
            ))}
          </ul>

          {postingsPage.totalPages > 1 ? (
            <nav
              aria-label="봉사 공고 페이지"
              className="mt-6 flex items-center justify-center gap-3"
            >
              <button
                type="button"
                disabled={postingsPage.page <= 0}
                className="rounded-lg px-3 py-2 text-sm disabled:text-text-gray-100"
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                이전
              </button>
              <span className="text-sm text-text-gray-400">
                {postingsPage.page + 1} / {postingsPage.totalPages}
              </span>
              <button
                type="button"
                disabled={postingsPage.page >= postingsPage.totalPages - 1}
                className="rounded-lg px-3 py-2 text-sm disabled:text-text-gray-100"
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                다음
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </PageContainer>
  );
}

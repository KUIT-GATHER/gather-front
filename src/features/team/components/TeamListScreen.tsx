import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";
import { useMeetingsQuery } from "@/features/team/hooks/useMeetingsQuery";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import type { MeetingListParams, MeetingStatus } from "../types/team.types";
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
  const queryParams = useMemo<MeetingListParams>(
    () => ({
      keyword: searchParams.get("keyword")?.trim() || undefined,
      regionId: toPositiveNumber(searchParams.get("regionId")),
      category: toPostingCategory(searchParams.get("category")),
      status: toMeetingStatus(searchParams.get("status")),
      page: 0,
      size: 10,
      sort: ["createdAt,desc"],
    }),
    [searchParams],
  );
  const meetingsQuery = useMeetingsQuery(queryParams);
  const meetingPage = meetingsQuery.data;
  const meetings = meetingPage?.content ?? [];
  const totalElements = meetingPage?.totalElements ?? 0;

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <PageHeader
        title="같이 갈 사람 찾는 중 🙌"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="ml-3 flex shrink-0 items-center gap-4">
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

      <div className="mt-6 flex items-center justify-between pb-3">
        <p className="text-xs text-gray-700">전체 {totalElements}개 활동</p>
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
        <ul className="flex flex-col gap-3">
          {meetings.map((team) => (
            <li key={team.meetingId}>
              <TeamCard
                team={team}
                onClick={() => navigate(`/teams/${team.meetingId}`)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </PageContainer>
  );
}

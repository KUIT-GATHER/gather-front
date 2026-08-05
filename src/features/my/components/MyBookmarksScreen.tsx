import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import { getBookmarkedMeetings } from "@/features/team/api/team.api";
import { TeamCard } from "@/features/team/components/TeamCard";
import { TeamFilterSheet } from "@/features/team/components/TeamFilterSheet";
import {
  getTeamListFilter,
  updateTeamListSearchParams,
} from "@/features/team/lib/teamListSearchParams";
import { getBookmarkedVolunteerPostings } from "@/features/volunteer/api/volunteer.api";
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
  const postingsQuery = useQuery({
    queryKey: ["volunteerPostings", "bookmarked", postingFilter],
    queryFn: () =>
      getBookmarkedVolunteerPostings({
        ...postingFilter,
        page: 0,
        size: 20,
      }),
    enabled: selectedTab === "postings",
  });
  const meetingsQuery = useQuery({
    queryKey: ["meetings", "bookmarked", meetingFilter],
    queryFn: () =>
      getBookmarkedMeetings({ ...meetingFilter, page: 0, size: 20 }),
    enabled: selectedTab === "meetings",
  });
  const activeQuery =
    selectedTab === "postings" ? postingsQuery : meetingsQuery;

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg">
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
              onClick={() => setSearchParams({ tab: tab.value })}
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
      <main className="space-y-3 px-5.5 py-5">
        {activeQuery.isLoading ? (
          <LoadingState label="찜한 활동을 불러오는 중" className="min-h-55" />
        ) : activeQuery.isError ? (
          <ErrorState
            title="찜한 활동을 불러오지 못했어요"
            description="잠시 후 다시 확인해 주세요."
            primaryAction={{
              label: "다시 시도",
              onClick: () => void activeQuery.refetch(),
            }}
          />
        ) : selectedTab === "postings" ? (
          postingsQuery.data?.content.length ? (
            postingsQuery.data.content.map((posting) => (
              <VolunteerPostingCard
                key={posting.id}
                posting={posting}
                onClick={() => navigate(`/volunteers/${posting.id}`)}
              />
            ))
          ) : (
            <EmptyState title="찜한 봉사 공고가 없어요" />
          )
        ) : meetingsQuery.data?.content.length ? (
          meetingsQuery.data.content.map((meeting) => (
            <TeamCard
              key={meeting.meetingId}
              team={meeting}
              regionName={meeting.regionName}
              onClick={() => navigate(`/teams/${meeting.meetingId}`)}
            />
          ))
        ) : (
          <EmptyState title="찜한 모임이 없어요" />
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
            )
          }
        />
      ) : null}
    </div>
  );
}

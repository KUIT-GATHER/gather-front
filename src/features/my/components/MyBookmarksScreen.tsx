import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";

import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getBookmarkedMeetings } from "@/features/team/api/team.api";
import { TeamCard } from "@/features/team/components/TeamCard";
import { getBookmarkedVolunteerPostings } from "@/features/volunteer/api/volunteer.api";
import { VolunteerPostingCard } from "@/features/volunteer/components/VolunteerPostingCard";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
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
  const selectedTab =
    searchParams.get("tab") === "meetings" ? "meetings" : "postings";
  const postingsQuery = useQuery({
    queryKey: ["volunteerPostings", "bookmarked"],
    queryFn: getBookmarkedVolunteerPostings,
    enabled: selectedTab === "postings",
  });
  const meetingsQuery = useQuery({
    queryKey: ["meetings", "bookmarked"],
    queryFn: getBookmarkedMeetings,
    enabled: selectedTab === "meetings",
  });
  const regionsQuery = useRegionsQuery(selectedTab === "meetings");
  const regionNameById = useMemo(
    () =>
      new Map(
        (regionsQuery.data ?? []).map((region) => [region.id, region.name]),
      ),
    [regionsQuery.data],
  );
  const activeQuery =
    selectedTab === "postings" ? postingsQuery : meetingsQuery;

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg">
      <div className="px-5.5">
        <PageHeader title="찜한 활동" onBack={() => navigate(-1)} />
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
                onClick={() => navigate(`/volunteer/${posting.id}`)}
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
              regionName={regionNameById.get(meeting.regionId) ?? null}
              onClick={() => navigate(`/teams/${meeting.meetingId}`)}
            />
          ))
        ) : (
          <EmptyState title="찜한 모임이 없어요" />
        )}
      </main>
    </div>
  );
}

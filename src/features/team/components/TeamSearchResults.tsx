import { useEffect, useRef, type ReactNode } from "react";

import { useInfiniteMeetingsQuery } from "@/features/team/hooks/useInfiniteMeetingsQuery";
import type { MeetingInfiniteParams } from "@/features/team/types/team.types";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import { ScrollTopButton } from "@/shared/ui/ScrollTopButton";

import { TeamCard } from "./TeamCard";

type TeamSearchResultsProps = {
  params: MeetingInfiniteParams;
  onSelect: (meetingId: number) => void;
  renderMeta?: (totalElements: number) => ReactNode;
};

export function TeamSearchResults({
  params,
  onSelect,
  renderMeta,
}: TeamSearchResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const query = useInfiniteMeetingsQuery(params);
  const meetings = query.data?.pages.flatMap((page) => page.content) ?? [];
  const totalElements = query.data?.pages[0]?.totalElements ?? 0;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage &&
          !query.isFetchNextPageError
        ) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [query]);

  const isInitialLoading = query.isLoading && meetings.length === 0;
  const isInitialError = query.isError && meetings.length === 0;

  return (
    <>
      {renderMeta?.(totalElements)}
      {isInitialLoading ? (
        <LoadingState label="모임을 불러오는 중" className="min-h-55" />
      ) : null}
      {isInitialError ? (
        <ErrorState
          title="모임을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => void query.refetch(),
          }}
        />
      ) : null}
      {query.isSuccess && meetings.length === 0 ? (
        <EmptyState
          title="검색 결과가 없어요"
          description="다른 검색어로 다시 찾아보세요."
        />
      ) : null}
      {meetings.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {meetings.map((meeting) => (
              <li key={meeting.meetingId}>
                <TeamCard
                  team={meeting}
                  onClick={() => onSelect(meeting.meetingId)}
                />
              </li>
            ))}
          </ul>
          <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
          {query.isFetchingNextPage ? (
            <LoadingState label="모임을 더 불러오는 중" className="min-h-24" />
          ) : null}
          {query.isFetchNextPageError ? (
            <div className="py-6 text-center">
              <p className="text-sm text-text-gray-400">
                모임을 더 불러오지 못했어요.
              </p>
              <button
                type="button"
                className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() => void query.fetchNextPage()}
              >
                다시 시도
              </button>
            </div>
          ) : null}
          {!query.isFetchingNextPage &&
          !query.isFetchNextPageError &&
          !query.hasNextPage ? (
            <p className="py-6 text-center text-sm text-text-gray-100">
              모든 모임을 확인했어요.
            </p>
          ) : null}
          <ScrollTopButton className="bottom-[calc(0.75rem+env(safe-area-inset-bottom))]" />
        </>
      ) : null}
    </>
  );
}

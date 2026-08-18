import { useEffect, useRef, type ReactNode } from "react";

import { useInfiniteVolunteerPostingsQuery } from "@/features/volunteer/hooks/useInfiniteVolunteerPostingsQuery";
import type { VolunteerPostingInfiniteParams } from "@/features/volunteer/types/volunteer.types";
import type { PostingListItem } from "@/features/volunteer/types/volunteer.types";
import { getPostingListItemKey } from "@/features/volunteer/lib/postingListRouting";
import { VolunteerPostingCard } from "@/features/volunteer/components/VolunteerPostingCard";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import { ScrollTopButton } from "@/shared/ui/ScrollTopButton";

type VolunteerPostingResultsProps = {
  params: VolunteerPostingInfiniteParams;
  emptyTitle: string;
  emptyDescription: string;
  onSelect: (posting: PostingListItem) => void;
  renderMeta?: (totalElements: number) => ReactNode;
};

export function VolunteerPostingResults({
  params,
  emptyTitle,
  emptyDescription,
  onSelect,
  renderMeta,
}: VolunteerPostingResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const query = useInfiniteVolunteerPostingsQuery(params);
  const postings = query.data?.pages.flatMap((page) => page.content) ?? [];
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

  const isInitialLoading = query.isLoading && postings.length === 0;
  const isInitialError = query.isError && postings.length === 0;
  const initialState = isInitialLoading ? (
    <LoadingState label="봉사 공고를 불러오는 중" />
  ) : isInitialError ? (
    <ErrorState
      title="봉사 공고를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      primaryAction={{
        label: "다시 시도",
        onClick: () => void query.refetch(),
      }}
    />
  ) : query.isSuccess && postings.length === 0 ? (
    <EmptyState title={emptyTitle} description={emptyDescription} />
  ) : null;

  return (
    <>
      {renderMeta?.(totalElements)}
      {initialState ? (
        <div className="flex min-h-55 flex-1 flex-col justify-center">
          {initialState}
        </div>
      ) : null}
      {postings.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {postings.map((posting) => (
              <li key={getPostingListItemKey(posting)}>
                <VolunteerPostingCard
                  posting={posting}
                  onClick={() => onSelect(posting)}
                />
              </li>
            ))}
          </ul>
          <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
          {query.isFetchingNextPage ? (
            <LoadingState
              label="봉사 공고를 더 불러오는 중"
              className="min-h-24"
            />
          ) : null}
          {query.isFetchNextPageError ? (
            <div className="py-6 text-center">
              <p className="text-sm text-text-gray-400">
                봉사 공고를 더 불러오지 못했어요.
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
              모든 봉사 공고를 확인했어요.
            </p>
          ) : null}
          <ScrollTopButton className="bottom-[calc(0.75rem+env(safe-area-inset-bottom))]" />
        </>
      ) : null}
    </>
  );
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import PenIcon from "@/assets/icons/Pen.svg";
import {
  MEETING_POST_TYPES,
  MEETING_POST_TYPE_LABELS,
} from "@/features/team/constants/meetingPost.constants";
import { useMeetingPostsQuery } from "@/features/team/hooks/useMeetingPostsQuery";
import type {
  MeetingPostListParams,
  MeetingPostType,
} from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import { SharedMeetingBoardPostCard } from "./SharedMeetingBoardPostCard";

type SharedMeetingBoardProps = {
  meetingId: number;
  meetingName: string;
  notice?: ReactNode;
  emptyMessage?: string;
  availableTypes?: readonly MeetingPostType[];
  showTypeFilter?: boolean;
  canWrite?: boolean;
  onWriteClick?: () => void;
};

export function SharedMeetingBoard({
  meetingId,
  meetingName,
  notice,
  emptyMessage = "현재 작성된 게시글이 존재하지 않습니다",
  availableTypes = MEETING_POST_TYPES,
  showTypeFilter = true,
  canWrite = false,
  onWriteClick,
}: SharedMeetingBoardProps) {
  const hasTypeFilter = showTypeFilter && availableTypes.length > 0;
  const [selectedTypes, setSelectedTypes] = useState<MeetingPostType[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const postListParams = useMemo(
    (): MeetingPostListParams =>
      hasTypeFilter && selectedTypes.length > 0 ? { types: selectedTypes } : {},
    [hasTypeFilter, selectedTypes],
  );
  const postsQuery = useMeetingPostsQuery(meetingId, postListParams);
  const posts = postsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const isInitialLoading = postsQuery.isLoading && posts.length === 0;
  const isInitialError = postsQuery.isError && posts.length === 0;
  const hasSelectedTypes = hasTypeFilter && selectedTypes.length > 0;
  const resolvedEmptyMessage = hasSelectedTypes
    ? "해당 분류의 게시글이 존재하지 않습니다"
    : emptyMessage;

  const handleTypeFilterClick = (type: MeetingPostType) => {
    setSelectedTypes((currentTypes) => {
      const nextTypes = currentTypes.includes(type)
        ? currentTypes.filter((selectedType) => selectedType !== type)
        : [...currentTypes, type];

      return availableTypes.filter((availableType) =>
        nextTypes.includes(availableType),
      );
    });
  };

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          postsQuery.hasNextPage &&
          !postsQuery.isFetchingNextPage &&
          !postsQuery.isFetchNextPageError
        ) {
          void postsQuery.fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [postsQuery]);

  return (
    <section
      aria-label={`${meetingName} 게시판`}
      className="relative px-5.5 pt-4 pb-24"
    >
      {notice}

      {hasTypeFilter ? (
        <div
          className={cn(
            "flex gap-2 overflow-x-auto pb-1",
            notice ? "mt-4" : "",
          )}
          aria-label="게시글 분류"
        >
          {availableTypes.map((type) => {
            const isSelected = selectedTypes.includes(type);

            return (
              <button
                key={type}
                type="button"
                aria-pressed={isSelected}
                className={cn(
                  "h-8 shrink-0 rounded-[40px] border-[0.5px] border-text-gray-400 px-3.5 text-[14px] leading-4 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                  isSelected
                    ? "bg-text-gray-400 text-white"
                    : "bg-white text-text-gray-400 active:bg-button/8",
                )}
                onClick={() => handleTypeFilterClick(type)}
              >
                {MEETING_POST_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className={cn(!hasTypeFilter && notice ? "mt-4" : "")}>
        {isInitialLoading ? (
          <LoadingState label="게시글을 불러오는 중" className="min-h-65" />
        ) : null}

        {isInitialError ? (
          <ErrorState
            title="게시글을 불러오지 못했어요"
            description="잠시 후 다시 확인해 주세요."
            className="min-h-65 justify-center"
          />
        ) : null}

        {postsQuery.isSuccess && posts.length === 0 ? (
          <p className="flex min-h-75 items-center justify-center text-center text-[18px] leading-5 font-medium text-text-gray-400">
            {resolvedEmptyMessage}
          </p>
        ) : null}

        {posts.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-3">
            {posts.map((post) => (
              <li key={post.postId}>
                <SharedMeetingBoardPostCard meetingId={meetingId} post={post} />
              </li>
            ))}
          </ul>
        ) : null}

        {posts.length > 0 ? (
          <>
            <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
            {postsQuery.isFetchingNextPage ? (
              <LoadingState
                label="게시글을 더 불러오는 중"
                className="min-h-24"
              />
            ) : null}
            {postsQuery.isFetchNextPageError ? (
              <div className="py-6 text-center">
                <p className="text-sm text-text-gray-400">
                  게시글을 더 불러오지 못했어요.
                </p>
                <button
                  type="button"
                  className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                  onClick={() => void postsQuery.fetchNextPage()}
                >
                  다시 시도
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {canWrite ? (
        <button
          type="button"
          aria-label="게시글 작성"
          disabled={!onWriteClick}
          className="fixed right-[max(1.375rem,calc(50%-11.25rem))] bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 inline-flex h-11 items-center gap-2 rounded-full bg-button px-5 text-[15px] leading-5 font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition active:bg-icon focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-default"
          onClick={onWriteClick}
        >
          <img src={PenIcon} alt="" className="size-4" aria-hidden="true" />글
          작성
        </button>
      ) : null}
    </section>
  );
}

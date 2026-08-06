import { useEffect, useRef } from "react";

import { SharedMeetingBoardPostCard } from "@/features/team/components/board/list/SharedMeetingBoardPostCard";
import {
  useMyMeetingActivityCommentedPostsQuery,
  useMyMeetingActivityPostsQuery,
} from "@/features/team/hooks/useMyMeetingActivityQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import type { MeetingPostSummary } from "@/features/team/types/team.types";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

type TeamActivityPostListContentProps = {
  meetingId: number;
  posts: MeetingPostSummary[];
  emptyMessage: string;
  loadingMessage: string;
  loadingMoreMessage: string;
  errorTitle: string;
  errorDescription: string;
  isInitialLoading: boolean;
  isInitialError: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  refetch: () => void;
  fetchNextPage: () => void;
};

function TeamActivityPostListContent({
  meetingId,
  posts,
  emptyMessage,
  loadingMessage,
  loadingMoreMessage,
  errorTitle,
  errorDescription,
  isInitialLoading,
  isInitialError,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  refetch,
  fetchNextPage,
}: TeamActivityPostListContentProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetchNextPageError
        ) {
          fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  if (isInitialLoading) {
    return <LoadingState label={loadingMessage} className="min-h-65 px-5.5" />;
  }

  if (isInitialError) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        className="min-h-65 justify-center px-5.5"
        primaryAction={{
          label: "다시 시도",
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <section className="px-5.5 py-5">
      {posts.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.postId}>
              <SharedMeetingBoardPostCard meetingId={meetingId} post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex min-h-75 items-center justify-center text-center text-[18px] leading-5 font-medium text-text-gray-400">
          {emptyMessage}
        </p>
      )}

      <div ref={loadMoreRef} aria-hidden="true" className="h-1" />

      {isFetchingNextPage ? (
        <LoadingState label={loadingMoreMessage} className="min-h-24" />
      ) : null}

      {isFetchNextPageError ? (
        <div className="py-6 text-center">
          <p className="text-sm text-text-gray-400">
            게시글을 더 불러오지 못했어요.
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={fetchNextPage}
          >
            다시 시도
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function TeamActivityWrittenPostsScreen() {
  const { meetingId } = useTeamDetailContext();
  const postsQuery = useMyMeetingActivityPostsQuery(meetingId);
  const posts = postsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <TeamActivityPostListContent
      meetingId={meetingId}
      posts={posts}
      emptyMessage="아직 작성한 게시글이 없어요."
      loadingMessage="작성한 게시글을 불러오는 중"
      loadingMoreMessage="작성한 게시글을 더 불러오는 중"
      errorTitle="작성한 게시글을 불러오지 못했어요"
      errorDescription="잠시 후 다시 확인해 주세요."
      isInitialLoading={postsQuery.isLoading && posts.length === 0}
      isInitialError={postsQuery.isError && posts.length === 0}
      isFetchingNextPage={postsQuery.isFetchingNextPage}
      isFetchNextPageError={postsQuery.isFetchNextPageError}
      hasNextPage={postsQuery.hasNextPage}
      refetch={() => void postsQuery.refetch()}
      fetchNextPage={() => void postsQuery.fetchNextPage()}
    />
  );
}

export function TeamActivityCommentedPostsScreen() {
  const { meetingId } = useTeamDetailContext();
  const postsQuery = useMyMeetingActivityCommentedPostsQuery(meetingId);
  const posts = postsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <TeamActivityPostListContent
      meetingId={meetingId}
      posts={posts}
      emptyMessage="아직 댓글 단 게시글이 없어요."
      loadingMessage="댓글 단 게시글을 불러오는 중"
      loadingMoreMessage="댓글 단 게시글을 더 불러오는 중"
      errorTitle="댓글 단 게시글을 불러오지 못했어요"
      errorDescription="잠시 후 다시 확인해 주세요."
      isInitialLoading={postsQuery.isLoading && posts.length === 0}
      isInitialError={postsQuery.isError && posts.length === 0}
      isFetchingNextPage={postsQuery.isFetchingNextPage}
      isFetchNextPageError={postsQuery.isFetchNextPageError}
      hasNextPage={postsQuery.hasNextPage}
      refetch={() => void postsQuery.refetch()}
      fetchNextPage={() => void postsQuery.fetchNextPage()}
    />
  );
}

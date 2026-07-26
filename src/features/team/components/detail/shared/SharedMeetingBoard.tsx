import type { ReactNode } from "react";

import { useMeetingPostsQuery } from "@/features/team/hooks/useMeetingPostsQuery";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import { SharedMeetingBoardPostCard } from "./SharedMeetingBoardPostCard";

type SharedMeetingBoardProps = {
  meetingId: number;
  meetingName: string;
  notice?: ReactNode;
  emptyMessage?: string;
};

export function SharedMeetingBoard({
  meetingId,
  meetingName,
  notice,
  emptyMessage = "현재 작성된 게시글이 존재하지 않습니다",
}: SharedMeetingBoardProps) {
  const postsQuery = useMeetingPostsQuery(meetingId);
  const posts = postsQuery.data ?? [];

  return (
    <section aria-label={`${meetingName} 게시판`} className="px-5.5 py-4">
      {notice}

      {postsQuery.isLoading ? (
        <LoadingState label="게시글을 불러오는 중" className="min-h-55" />
      ) : null}

      {postsQuery.isError ? (
        <ErrorState
          title="게시글을 불러오지 못했어요"
          description="잠시 후 다시 확인해 주세요."
          className="min-h-55 justify-center"
        />
      ) : null}

      {postsQuery.isSuccess && posts.length === 0 ? (
        <p className="flex min-h-75 items-center justify-center text-center text-[18px] leading-5 font-medium text-text-gray-400">
          {emptyMessage}
        </p>
      ) : null}

      {posts.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.postId}>
              <SharedMeetingBoardPostCard post={post} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

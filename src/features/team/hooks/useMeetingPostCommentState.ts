import { useEffect, useState } from "react";

import { useMeetingPostCommentsQuery } from "@/features/team/hooks/useMeetingPostCommentsQuery";
import { useCreateMeetingPostCommentMutation } from "@/features/team/hooks/useMeetingPostMutations";

export function useMeetingPostCommentState(meetingId: number, postId: number) {
  const [commentContent, setCommentContent] = useState("");
  const [loadMoreElement, setLoadMoreElement] = useState<HTMLDivElement | null>(
    null,
  );
  const commentsQuery = useMeetingPostCommentsQuery(meetingId, postId);
  const createCommentMutation = useCreateMeetingPostCommentMutation(
    meetingId,
    postId,
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    isSuccess,
  } = commentsQuery;
  const comments = data?.pages.flatMap((page) => page.content) ?? [];
  const trimmedComment = commentContent.trim();
  const canSubmitComment =
    trimmedComment.length > 0 && !createCommentMutation.isPending;
  const isInitialLoading = isLoading && comments.length === 0;
  const isInitialError = isError && comments.length === 0;
  const isEmpty = isSuccess && comments.length === 0;

  useEffect(() => {
    if (!loadMoreElement) return;

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
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    loadMoreElement,
  ]);

  const submitComment = () => {
    if (!canSubmitComment) {
      return;
    }

    createCommentMutation.mutate(
      { content: trimmedComment },
      {
        onSuccess: () => setCommentContent(""),
      },
    );
  };

  return {
    comments,
    commentContent,
    setCommentContent,
    canSubmitComment,
    submitComment,
    isCreatingComment: createCommentMutation.isPending,
    isInitialLoading,
    isInitialError,
    isEmpty,
    setLoadMoreElement,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  };
}

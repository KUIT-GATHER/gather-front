import { useMemo, useState, type ReactNode } from "react";

import PenIcon from "@/assets/icons/Pen.svg";
import {
  MEETING_POST_TYPES,
  MEETING_POST_TYPE_LABELS,
} from "@/features/team/constants/meetingPost.constants";
import { useMeetingPostsQuery } from "@/features/team/hooks/useMeetingPostsQuery";
import type { MeetingPostType } from "@/features/team/types/team.types";
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
  canWrite?: boolean;
  onWriteClick?: () => void;
};

export function SharedMeetingBoard({
  meetingId,
  meetingName,
  notice,
  emptyMessage = "현재 작성된 게시글이 존재하지 않습니다",
  availableTypes = MEETING_POST_TYPES,
  canWrite = false,
  onWriteClick,
}: SharedMeetingBoardProps) {
  const [selectedType, setSelectedType] = useState<MeetingPostType | undefined>(
    undefined,
  );
  const postListParams = useMemo(
    () => (selectedType ? { type: selectedType } : {}),
    [selectedType],
  );
  const postsQuery = useMeetingPostsQuery(meetingId, postListParams);
  const posts = postsQuery.data ?? [];
  const resolvedEmptyMessage = selectedType
    ? "해당 분류의 게시글이 존재하지 않습니다"
    : emptyMessage;

  return (
    <section
      aria-label={`${meetingName} 게시판`}
      className="relative px-5.5 pt-4 pb-24"
    >
      {notice}

      <div
        className={cn("flex gap-2 overflow-x-auto pb-1", notice ? "mt-4" : "")}
        aria-label="게시글 분류"
      >
        {availableTypes.map((type) => {
          const isSelected = selectedType === type;

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
              onClick={() => setSelectedType(isSelected ? undefined : type)}
            >
              {MEETING_POST_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      {postsQuery.isLoading ? (
        <LoadingState label="게시글을 불러오는 중" className="min-h-65" />
      ) : null}

      {postsQuery.isError ? (
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

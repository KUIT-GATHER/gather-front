import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import CommentIcon from "@/assets/icons/Comment.svg";
import ExtraIcon from "@/assets/icons/Extra.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import LinkCopyIcon from "@/assets/icons/Linkcopy.svg";
import {
  MEETING_POST_TYPE_BADGE_CLASS_NAMES,
  MEETING_POST_TYPE_LABELS,
} from "@/features/team/constants/meetingPost.constants";
import { useDeleteMeetingPostMutation } from "@/features/team/hooks/useMeetingPostMutations";
import type { MeetingPost } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

type MeetingPostDetailProps = {
  post: MeetingPost;
};

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function MeetingPostDetail({ post }: MeetingPostDetailProps) {
  const navigate = useNavigate();
  const [copyToastId, setCopyToastId] = useState(0);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const deletePostMutation = useDeleteMeetingPostMutation(
    post.meetingId,
    post.postId,
  );

  useEffect(() => {
    if (copyToastId === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyToastId(0);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyToastId]);

  useEffect(() => {
    if (!isActionMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActionMenuOpen]);

  const handleCopyLink = async () => {
    await copyTextToClipboard(window.location.href);
    setCopyToastId((current) => current + 1);
  };

  const handleDeleteClick = () => {
    setIsActionMenuOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deletePostMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate(`/teams/${post.meetingId}/posts`, { replace: true });
      },
    });
  };

  return (
    <section className="px-5.5 pt-2 pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-[30px] px-2.5 py-1 text-[14px] leading-4 font-medium",
            MEETING_POST_TYPE_BADGE_CLASS_NAMES[post.type],
          )}
        >
          {MEETING_POST_TYPE_LABELS[post.type]}
        </span>
      </div>

      <div className="mt-4 flex items-center">
        <h2 className="flex-1 text-[18px] leading-6 font-semibold text-text">
          {post.title}
        </h2>
        <div ref={actionMenuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="게시글 더보기"
            aria-haspopup="menu"
            aria-expanded={isActionMenuOpen}
            className="grid size-6 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => setIsActionMenuOpen((current) => !current)}
          >
            <img src={ExtraIcon} alt="" className="size-6" aria-hidden="true" />
          </button>

          {isActionMenuOpen ? (
            <div
              role="menu"
              aria-label="게시글 메뉴"
              className="absolute top-7 right-0 z-30 flex w-31 flex-col overflow-hidden rounded-xl border border-[#2B6137] bg-white px-3 py-3"
            >
              <button
                type="button"
                role="menuitem"
                className="flex h-11 items-center justify-center text-[15px] leading-7 font-medium text-text transition-colors hover:text-point-red focus:text-point-red active:text-point-red focus:outline-none"
                onClick={handleDeleteClick}
              >
                게시글 삭제
              </button>
              <div
                className="mx-auto h-px w-[100px] bg-stroke"
                aria-hidden="true"
              />
              <button
                type="button"
                role="menuitem"
                aria-disabled="true"
                className="flex h-11 cursor-default items-center justify-center text-[15px] leading-7 font-medium text-text transition-colors hover:text-point-red focus:text-point-red active:text-point-red focus:outline-none"
              >
                게시글 수정
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-1 text-[14px] leading-4 font-medium text-text-gray-400">
        <span>{formatPostDate(post.createdAt)}</span>
        <span> | </span>
        <span>{post.authorNickname}</span>
      </div>

      <p className="mt-4.75 whitespace-pre-line text-[16px] leading-6 font-medium text-text">
        {post.content}
      </p>

      {/* 사진 추후 추가 예정 */}

      <div className="mt-7 border-t border-stroke pt-4">
        <div className="flex items-center justify-between gap-4 text-text-gray-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <img
                aria-hidden="true"
                src={HeartIcon}
                alt=""
                className="h-4 w-[17.778px]"
              />
              <span className="text-[16px] leading-5 font-medium">
                {post.likeCount}
              </span>
            </span>

            <span className="inline-flex items-center gap-2">
              <img
                aria-hidden="true"
                src={CommentIcon}
                alt=""
                className="size-4.5"
              />
              <span className="text-[16px] leading-5 font-medium">
                {post.commentCount}
              </span>
            </span>
          </div>

          <button
            type="button"
            aria-label="링크 복사"
            className="grid size-6 shrink-0 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={handleCopyLink}
          >
            <img
              src={LinkCopyIcon}
              alt=""
              className="size-6"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {copyToastId > 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-1/2 left-1/2 z-50 flex h-12 w-[calc(100%-2.75rem)] max-w-[22.375rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-[#DCECDF] px-5.5 text-center text-[15px] leading-4 font-medium text-text"
        >
          링크가 복사 되었습니다.
        </div>
      ) : null}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="게시글을 삭제하시겠어요?"
        cancelText="취소"
        confirmText="확인"
        isPending={deletePostMutation.isPending}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      >
        삭제된 게시글은 <br /> 다시 복구할 수 없습니다.
      </ConfirmDialog>
    </section>
  );
}

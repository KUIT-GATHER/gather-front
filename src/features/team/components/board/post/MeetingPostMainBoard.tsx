import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import ExtraIcon from "@/assets/icons/Extra.svg";
import { useDeleteMeetingPostMutation } from "@/features/team/hooks/useMeetingPostMutations";
import { formatMeetingPostDate } from "@/features/team/lib/formatMeetingPostDate";
import type { MeetingPost } from "@/features/team/types/team.types";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

import { BoardActionMenuPanel } from "../shared/BoardActionMenuPanel";
import { MeetingPostImageCarousel } from "./MeetingPostImageCarousel";
import { MeetingPostTypeBadge } from "../shared/MeetingPostTypeBadge";

type MeetingPostMainBoardProps = {
  post: MeetingPost;
};

export function MeetingPostMainBoard({ post }: MeetingPostMainBoardProps) {
  const navigate = useNavigate();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const deletePostMutation = useDeleteMeetingPostMutation(
    post.meetingId,
    post.postId,
  );

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
    <>
      <div className="flex flex-wrap items-center gap-2">
        <MeetingPostTypeBadge
          type={post.type}
          className="text-[14px] font-medium"
        />
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
            <BoardActionMenuPanel
              ariaLabel="게시글 메뉴"
              items={[
                {
                  label: "게시글 삭제",
                  disabled: !post.canDelete || deletePostMutation.isPending,
                  onClick: handleDeleteClick,
                },
                { label: "게시글 수정" },
              ]}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-1 text-[14px] leading-4 font-medium text-text-gray-400">
        <span>{formatMeetingPostDate(post.createdAt)}</span>
        <span> | </span>
        <span>{post.authorNickname}</span>
      </div>

      <p className="mt-4.75 whitespace-pre-line text-[16px] leading-6 font-medium text-text">
        {post.content}
      </p>

      <MeetingPostImageCarousel imageUrls={post.imageUrls} title={post.title} />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="게시글을 삭제하시겠어요?"
        isPending={deletePostMutation.isPending}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      >
        삭제된 게시글은 <br /> 다시 복구할 수 없습니다.
      </ConfirmDialog>
    </>
  );
}

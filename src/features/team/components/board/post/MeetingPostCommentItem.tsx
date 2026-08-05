import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import ExtraGrayIcon from "@/assets/icons/Extra-gray.svg";
import {
  useDeleteMeetingPostCommentMutation,
  useUpdateMeetingPostCommentMutation,
} from "@/features/team/hooks/useMeetingPostMutations";
import type { MeetingPostComment as MeetingPostCommentType } from "@/features/team/types/team.types";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

import { BoardActionMenuPanel } from "../shared/BoardActionMenuPanel";

type MeetingPostCommentItemProps = {
  meetingId: number;
  postId: number;
  comment: MeetingPostCommentType;
  isEditing: boolean;
  onEditEnd: () => void;
  onEditStart: () => void;
};

const COMMENT_MENU_HEIGHT_WITH_GAP = 132;
const COMMENT_INPUT_RESERVED_HEIGHT = 80;

function formatCommentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}.${day}`;
}

function CommentAvatar({ nickname }: { nickname: string }) {
  const initial = nickname.trim().slice(0, 1) || "?";

  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke bg-white text-[12px] leading-4 font-medium text-text"
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function CommentActionMenu({
  children,
  disabled,
  onClick,
  onPointerDown,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  onPointerDown?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="댓글 더보기"
      disabled={disabled}
      className="grid size-6 shrink-0 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      {children}
    </button>
  );
}

export function MeetingPostCommentItem({
  meetingId,
  postId,
  comment,
  isEditing,
  onEditEnd,
  onEditStart,
}: MeetingPostCommentItemProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isActionMenuAbove, setIsActionMenuAbove] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldSkipBlurCommitRef = useRef(false);
  const deleteCommentMutation = useDeleteMeetingPostCommentMutation(
    meetingId,
    postId,
    comment.commentId,
  );
  const updateCommentMutation = useUpdateMeetingPostCommentMutation(
    meetingId,
    postId,
    comment.commentId,
  );
  const trimmedEditContent = editContent.trim();

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = editTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = editTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [editContent, isEditing]);

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

  const handleEditClick = () => {
    setIsActionMenuOpen(false);
    setEditContent(comment.content);
    onEditStart();
  };

  const handleEditCancel = () => {
    if (updateCommentMutation.isPending) {
      return;
    }

    setEditContent(comment.content);
    onEditEnd();
  };

  const commitEdit = () => {
    if (shouldSkipBlurCommitRef.current) {
      shouldSkipBlurCommitRef.current = false;
      return;
    }

    if (updateCommentMutation.isPending) {
      return;
    }

    if (!trimmedEditContent) {
      handleEditCancel();
      return;
    }

    if (trimmedEditContent === comment.content.trim()) {
      onEditEnd();
      return;
    }

    updateCommentMutation.mutate(
      { content: trimmedEditContent },
      {
        onSuccess: () => {
          onEditEnd();
        },
        onError: () => {
          setEditContent(comment.content);
          onEditEnd();
        },
      },
    );
  };

  const handleEditKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleEditCancel();
    }
  };

  const handleActionMenuToggle = () => {
    if (isActionMenuOpen) {
      setIsActionMenuOpen(false);
      return;
    }

    const rect = actionMenuRef.current?.getBoundingClientRect();

    if (rect) {
      setIsActionMenuAbove(
        rect.bottom + COMMENT_MENU_HEIGHT_WITH_GAP >
          window.innerHeight - COMMENT_INPUT_RESERVED_HEIGHT,
      );
    }

    setIsActionMenuOpen(true);
  };

  const handleActionMenuPointerDown = () => {
    if (!isEditing || updateCommentMutation.isPending) {
      return;
    }

    shouldSkipBlurCommitRef.current = true;
    setEditContent(comment.content);
    onEditEnd();
  };

  const handleDeleteConfirm = () => {
    deleteCommentMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <li className="border-b border-stroke py-3">
      <div className="flex gap-2">
        <CommentAvatar nickname={comment.authorNickname} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] leading-5 font-semibold text-text">
                {comment.authorNickname}
              </p>
              {isEditing ? (
                <textarea
                  ref={editTextareaRef}
                  aria-label="댓글 수정 입력"
                  maxLength={500}
                  rows={1}
                  value={editContent}
                  disabled={updateCommentMutation.isPending}
                  className="mt-1 block min-h-5 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[14px] leading-5 font-normal whitespace-pre-wrap text-text caret-text outline-none disabled:bg-transparent disabled:text-text"
                  onBlur={commitEdit}
                  onChange={(event) => setEditContent(event.target.value)}
                  onKeyDown={handleEditKeyDown}
                />
              ) : (
                <p className="mt-1 whitespace-pre-line text-[14px] leading-5 text-text">
                  {comment.content}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end text-text-gray-100">
              <span className="text-[12px] leading-4">
                {formatCommentDate(comment.createdAt)}
              </span>
              <div ref={actionMenuRef} className="relative mt-1">
                <CommentActionMenu
                  disabled={
                    deleteCommentMutation.isPending ||
                    updateCommentMutation.isPending
                  }
                  onClick={handleActionMenuToggle}
                  onPointerDown={handleActionMenuPointerDown}
                >
                  <img
                    src={ExtraGrayIcon}
                    alt=""
                    className="h-[18px] w-1"
                    aria-hidden="true"
                  />
                </CommentActionMenu>

                {isActionMenuOpen ? (
                  <BoardActionMenuPanel
                    ariaLabel="댓글 메뉴"
                    className={
                      isActionMenuAbove ? "top-auto bottom-6" : "top-6"
                    }
                    items={[
                      {
                        label: "댓글 삭제",
                        disabled:
                          !comment.canDelete || deleteCommentMutation.isPending,
                        onClick: handleDeleteClick,
                      },
                      {
                        label: "댓글 수정",
                        disabled:
                          !comment.canEdit || updateCommentMutation.isPending,
                        onClick: handleEditClick,
                      },
                    ]}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="댓글을 삭제하시겠어요?"
        confirmText="확인"
        confirmVariant="primary"
        isPending={deleteCommentMutation.isPending}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      ></ConfirmDialog>
    </li>
  );
}

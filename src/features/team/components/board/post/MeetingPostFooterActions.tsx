import { useEffect, useState } from "react";

import CommentIcon from "@/assets/icons/Comment.svg";
import FilledHeartIcon from "@/assets/icons/Filledheart.svg";
import LinkCopyIcon from "@/assets/icons/Linkcopy.svg";
import UnfilledHeartIcon from "@/assets/icons/Unfilledheart.svg";
import { cn } from "@/shared/lib/cn";

type MeetingPostFooterActionsProps = {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isLikePending?: boolean;
  onLikeToggle: () => void;
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

export function MeetingPostFooterActions({
  likeCount,
  commentCount,
  isLiked,
  isLikePending = false,
  onLikeToggle,
}: MeetingPostFooterActionsProps) {
  const [copyToastId, setCopyToastId] = useState(0);

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

  const handleCopyLink = async () => {
    await copyTextToClipboard(window.location.href);
    setCopyToastId((current) => current + 1);
  };

  return (
    <>
      <div className="mt-4 border-t border-stroke pt-5">
        <div className="flex items-center justify-between gap-4 text-text-gray-400">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              aria-pressed={isLiked}
              disabled={isLikePending}
              className={cn(
                "inline-flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
              onClick={onLikeToggle}
            >
              <img
                aria-hidden="true"
                src={isLiked ? FilledHeartIcon : UnfilledHeartIcon}
                alt=""
                className="h-4 w-[17.778px]"
              />
              <span className="text-[16px] leading-5 font-medium">
                {likeCount}
              </span>
            </button>

            <span className="inline-flex items-center gap-2">
              <img
                aria-hidden="true"
                src={CommentIcon}
                alt=""
                className="size-4.5"
              />
              <span className="text-[16px] leading-5 font-medium">
                {commentCount}
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
    </>
  );
}

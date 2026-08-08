import { toast } from "sonner";

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
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

export function MeetingPostFooterActions({
  likeCount,
  commentCount,
  isLiked,
  isLikePending = false,
  onLikeToggle,
}: MeetingPostFooterActionsProps) {
  const handleCopyLink = async () => {
    try {
      await copyTextToClipboard(window.location.href);
      toast("링크를 복사했어요", { id: "clipboard-toast" });
    } catch {
      toast("복사에 실패했어요. 다시 시도해 주세요", {
        id: "clipboard-toast",
      });
    }
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
    </>
  );
}

import FilledHeartIcon from "@/assets/icons/Filledheart.svg";
import UnfilledHeartIcon from "@/assets/icons/Unfilledheart.svg";
import { cn } from "@/shared/lib/cn";

type MeetingBookmarkButtonProps = {
  isBookmarked: boolean;
  isPending: boolean;
  onToggle: () => void;
  className?: string;
};

export function MeetingBookmarkButton({
  isBookmarked,
  isPending,
  onToggle,
  className,
}: MeetingBookmarkButtonProps) {
  return (
    <button
      type="button"
      aria-label={isBookmarked ? "관심 모임에서 삭제" : "관심 모임으로 저장"}
      aria-pressed={isBookmarked}
      disabled={isPending}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full transition hover:bg-point-red/8",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-point-red/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      onClick={onToggle}
    >
      <img
        src={isBookmarked ? FilledHeartIcon : UnfilledHeartIcon}
        alt=""
        aria-hidden="true"
        className="h-[18px] w-5"
      />
    </button>
  );
}

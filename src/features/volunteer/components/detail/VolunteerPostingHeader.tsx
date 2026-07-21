import ArrowIcon from "@/assets/icons/Arrow.svg";
import FilledHeartIcon from "@/assets/icons/Filledheart.svg";
import UnfilledHeartIcon from "@/assets/icons/Unfilledheart.svg";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingHeaderProps = {
  title?: string;
  onBack: () => void;
  isBookmarked?: boolean;
  isBookmarkPending?: boolean;
  onBookmarkToggle?: () => void;
  sticky?: boolean;
  className?: string;
};

export function VolunteerPostingHeader({
  title = "봉사 공고",
  onBack,
  isBookmarked = false,
  isBookmarkPending = false,
  onBookmarkToggle,
  sticky = false,
  className,
}: VolunteerPostingHeaderProps) {
  return (
    <header
      className={cn(
        "relative w-full bg-bg pt-[env(safe-area-inset-top)]",
        sticky && "sticky top-0 z-40",
        className,
      )}
    >
      <div className="flex h-17.5 items-center gap-1">
        <button
          type="button"
          aria-label="뒤로가기"
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={onBack}
        >
          <img
            src={ArrowIcon}
            alt=""
            className="size-7 rotate-180"
            aria-hidden="true"
          />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-body-15-semibold text-text">
          {title}
        </h1>

        {onBookmarkToggle ? (
          <button
            type="button"
            aria-label={
              isBookmarked ? "관심 봉사에서 삭제" : "관심 봉사로 저장"
            }
            aria-pressed={isBookmarked}
            disabled={isBookmarkPending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full transition hover:bg-point-red/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-point-red/30 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onBookmarkToggle}
          >
            <img
              src={isBookmarked ? FilledHeartIcon : UnfilledHeartIcon}
              alt=""
              aria-hidden="true"
              className="size-5"
            />
          </button>
        ) : null}
      </div>
    </header>
  );
}

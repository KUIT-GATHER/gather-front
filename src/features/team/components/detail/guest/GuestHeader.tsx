import ArrowIcon from "@/assets/icons/Arrow.svg";
import { MeetingBookmarkButton } from "@/features/team/components/detail/shared/MeetingBookmarkButton";

type GuestHeaderProps = {
  title: string;
  onBack: () => void;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
};

export function GuestHeader({
  title,
  onBack,
  isBookmarked,
  isBookmarkPending,
  onBookmarkToggle,
}: GuestHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg pt-[env(safe-area-inset-top)]">
      <div className="flex h-17.5 items-center gap-2.5 px-2.5">
        <button
          type="button"
          aria-label="뒤로가기"
          className="flex shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={onBack}
        >
          <img
            src={ArrowIcon}
            alt=""
            className="size-9 rotate-180"
            aria-hidden="true"
          />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-[20px] leading-6 font-semibold not-italic text-text">
          {title}
        </h1>

        <MeetingBookmarkButton
          isBookmarked={isBookmarked}
          isPending={isBookmarkPending}
          onToggle={onBookmarkToggle}
        />
      </div>
    </header>
  );
}

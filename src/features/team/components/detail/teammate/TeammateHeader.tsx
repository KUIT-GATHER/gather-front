import ArrowIcon from "@/assets/icons/Arrow.svg";
import SettingsIcon from "@/assets/icons/Settings.svg";
import { MeetingBookmarkButton } from "@/features/team/components/detail/shared/MeetingBookmarkButton";
import type { TeammateViewerRole } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type TeammateHeaderAction = "bookmark" | "settings" | "none";

type TeammateHeaderProps = {
  title: string;
  viewerRole: TeammateViewerRole;
  action: TeammateHeaderAction;
  showSettingsInsteadOfRole?: boolean;
  onBack: () => void;
  onSettingsClick: () => void;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
};

export function TeammateHeader({
  title,
  viewerRole,
  action,
  showSettingsInsteadOfRole = false,
  onBack,
  onSettingsClick,
  isBookmarked,
  isBookmarkPending,
  onBookmarkToggle,
}: TeammateHeaderProps) {
  const roleLabel = viewerRole === "leader" ? "팀장" : "팀원";
  const roleBadge = (
    <span
      className={cn(
        "shrink-0 rounded-lg border border-[#6d6970] px-2.5 py-0.75 text-[14px] leading-5",
        viewerRole === "leader"
          ? "bg-[#6D6970] text-text2"
          : "bg-white text-[#6d6970]",
      )}
    >
      {roleLabel}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 bg-bg pt-[env(safe-area-inset-top)]">
      <div className="flex h-17.5 items-center gap-2.5 pl-2.5 pr-7.5">
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

        <h1 className="min-w-0 flex-1 truncate text-[20px] leading-7 font-semibold not-italic text-text">
          {title}
        </h1>

        {action === "bookmark" ? (
          <MeetingBookmarkButton
            isBookmarked={isBookmarked}
            isPending={isBookmarkPending}
            onToggle={onBookmarkToggle}
          />
        ) : null}

        {showSettingsInsteadOfRole ? (
          <button
            type="button"
            aria-label="모임 설정"
            className="grid size-8 shrink-0 place-items-center rounded-full text-text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={onSettingsClick}
          >
            <img src={SettingsIcon} alt="" className="size-5.3" />
          </button>
        ) : (
          roleBadge
        )}

        {action === "settings" ? (
          <button
            type="button"
            aria-label="모임 설정"
            onClick={onSettingsClick}
            className="grid size-8 shrink-0 place-items-center rounded-full text-text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-default"
          >
            <img src={SettingsIcon} alt="" className="size-5.3" />
          </button>
        ) : null}
      </div>
    </header>
  );
}

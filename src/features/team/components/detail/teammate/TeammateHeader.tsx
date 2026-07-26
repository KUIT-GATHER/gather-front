import ArrowIcon from "@/assets/icons/Arrow.svg";
import type { TeammateViewerRole } from "@/features/team/types/team.types";

type TeammateHeaderProps = {
  title: string;
  viewerRole: TeammateViewerRole;
  onBack: () => void;
};

export function TeammateHeader({
  title,
  viewerRole,
  onBack,
}: TeammateHeaderProps) {
  const roleLabel = viewerRole === "leader" ? "팀장" : "팀원";

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

        <span className="shrink-0 rounded-lg border border-[#6d6970] bg-white px-3 py-1 text-[14px] leading-5 text-[#6d6970]">
          {roleLabel}
        </span>
      </div>
    </header>
  );
}

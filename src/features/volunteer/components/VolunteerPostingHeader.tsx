import ArrowIcon from "@/assets/icons/Arrow.svg";
import { cn } from "@/shared/lib/cn";
import { Heart } from "lucide-react";

type VolunteerPostingHeaderProps = {
  title?: string;
  onBack: () => void;
  sticky?: boolean;
  className?: string;
};

export function VolunteerPostingHeader({
  title = "봉사 공고",
  onBack,
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
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition hover:bg-text/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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

        <button
          type="button"
          aria-label="관심 봉사로 저장"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-point-red transition hover:bg-point-red/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-point-red/30"
        >
          <Heart aria-hidden="true" className="size-5 fill-current" />
        </button>
      </div>
    </header>
  );
}

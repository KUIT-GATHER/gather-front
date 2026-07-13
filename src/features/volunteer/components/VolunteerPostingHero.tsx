import { Heart } from "lucide-react";

import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingHeroProps = {
  posting: VolunteerPosting;
};

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80";

const statusLabels: Record<VolunteerPosting["status"], string> = {
  RECRUITING: "모집중",
  CLOSED: "모집마감",
  COMPLETED: "활동완료",
};

const statusClasses: Record<VolunteerPosting["status"], string> = {
  RECRUITING: "bg-button/10 text-button",
  CLOSED: "bg-point-red/10 text-point-red",
  COMPLETED: "bg-stroke/60 text-text-gray-300",
};

function Tag({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VolunteerPostingHero({ posting }: VolunteerPostingHeroProps) {
  return (
    <section>
      <div className="overflow-hidden rounded-lg bg-stroke">
        <img
          src={DEFAULT_HERO_IMAGE}
          alt=""
          className="aspect-[344/180] w-full object-cover"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Tag className="bg-[#FFF4D9] text-[#C58A00]">
              {posting.categoryName}
            </Tag>
            <Tag className="bg-point-green/20 text-icon">
              {posting.regionName}
            </Tag>
            <Tag className={statusClasses[posting.status]}>
              {statusLabels[posting.status]}
            </Tag>
          </div>

          <h1 className="mt-2 text-title-20 text-text">{posting.title}</h1>
        </div>

        <button
          type="button"
          aria-label="관심 봉사로 저장"
          className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-point-red transition hover:bg-point-red/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-point-red/30"
        >
          <Heart aria-hidden="true" className="size-5 fill-current" />
        </button>
      </div>

      <p className="mt-3 whitespace-pre-line text-body-14 text-text-gray-300">
        {posting.content}
      </p>
    </section>
  );
}

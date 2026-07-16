import defaultHeroImage from "@/assets/icons/Temp-volunteer-posting.svg";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingHeroProps = {
  posting: VolunteerPosting;
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
      <div className="overflow-hidden rounded-lg">
        <img
          src={defaultHeroImage}
          alt=""
          className="aspect-[344/175] w-full object-cover"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Tag className="bg-[#FFF4D9] text-[#C58A00]">
          {posting.categoryName}
        </Tag>
        <Tag className="bg-point-green/20 text-icon">{posting.regionName}</Tag>
      </div>

      <p className="mt-2 whitespace-pre-line text-[15px] leading-[28px] font-medium text-text">
        {posting.content}
      </p>
    </section>
  );
}

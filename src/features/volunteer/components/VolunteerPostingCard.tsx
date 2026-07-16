import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import {
  formatVolunteerDate,
  formatVolunteerLocation,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type { VolunteerPostingListItem } from "@/features/volunteer/types/volunteer.types";

type VolunteerPostingCardProps = {
  posting: VolunteerPostingListItem;
  onClick: () => void;
  variant?: "list" | "compact";
};

export function VolunteerPostingCard({
  posting,
  onClick,
  variant = "list",
}: VolunteerPostingCardProps) {
  const imageSrc = getVolunteerPostingImage(posting.category);
  const location = formatVolunteerLocation(posting);
  const activityDate = formatVolunteerDate(posting.actStartDate);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-40 shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <img
          src={imageSrc}
          alt=""
          className="aspect-square w-40 rounded-xl border border-stroke bg-[#F8FBF8] object-cover p-5"
        />
        <h3 className="mt-2 truncate text-[15px] font-bold">{posting.title}</h3>
        {location || activityDate ? (
          <p className="mt-1 truncate text-sm text-gray-500">
            {[location, activityDate].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-4 rounded-xl border border-gray-200 p-3 text-left"
    >
      <img
        src={imageSrc}
        alt=""
        className="h-[104px] w-[88px] shrink-0 rounded-lg border border-stroke bg-[#F8FBF8] object-cover p-3"
      />

      <div className="min-w-0 flex-1 py-0.5">
        <h2 className="truncate text-base font-bold">{posting.title}</h2>
        {posting.recruitOrg ? (
          <p className="mt-1 truncate text-sm text-gray-500">
            {posting.recruitOrg}
          </p>
        ) : null}
        {location || activityDate ? (
          <p className="mt-1 text-sm text-gray-500">
            {[location, activityDate].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1">
          <CategoryBadge category={posting.category} />
        </div>
      </div>
    </button>
  );
}

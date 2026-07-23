import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import {
  formatVolunteerDate,
  formatVolunteerHomeDate,
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
  const imageSrc = getVolunteerPostingImage(posting.category, posting.id);
  const location = formatVolunteerLocation(posting);
  const activityDate =
    variant === "compact"
      ? formatVolunteerHomeDate(posting.actStartDate)
      : formatVolunteerDate(posting.actStartDate);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-34 shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <img
          src={imageSrc}
          alt=""
          className="aspect-square w-34 rounded-xl border border-stroke object-cover"
        />
        <h3 className="mt-2 truncate text-body-15-semibold text-text">
          {posting.title}
        </h3>
        {location || activityDate ? (
          <p className="mt-1 truncate text-sm text-text-gray-300">
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
      className="flex w-full gap-3 rounded-xl border border-stroke bg-white p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
    >
      <img
        src={imageSrc}
        alt=""
        className="size-22 shrink-0 rounded-lg border border-stroke object-cover"
      />

      <div className="min-w-0 flex-1 py-0.5">
        <h2 className="truncate text-body-15-semibold text-text">
          {posting.title}
        </h2>
        {posting.recruitOrg ? (
          <p className="mt-1 truncate text-sm text-text-gray-300">
            {posting.recruitOrg}
          </p>
        ) : null}
        {location || activityDate ? (
          <p className="mt-1 line-clamp-2 text-sm text-text-gray-300">
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

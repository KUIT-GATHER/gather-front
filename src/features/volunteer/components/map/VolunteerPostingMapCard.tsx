import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import { formatVolunteerShortDate } from "@/features/volunteer/lib/volunteerPostingFormatters";
import type { VolunteerPostingMapItem } from "@/features/volunteer/types/volunteer.types";

type VolunteerPostingMapCardProps = {
  posting: VolunteerPostingMapItem;
  onClick: () => void;
};

export function VolunteerPostingMapCard({
  posting,
  onClick,
}: VolunteerPostingMapCardProps) {
  const activityDate = formatVolunteerShortDate(
    posting.activityStartAt?.slice(0, 10) ?? null,
  );
  const metadata = [posting.regionName, activityDate]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-stroke bg-white p-4 text-left shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
    >
      <img
        src={getVolunteerPostingImage(posting.category, posting.id)}
        alt=""
        className="size-30 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-title-18 text-text">{posting.title}</h2>
        {posting.organizationName ? (
          <p className="mt-2 truncate text-body-15 text-text-gray-400">
            {posting.organizationName}
          </p>
        ) : null}
        {metadata ? (
          <p className="mt-1 truncate text-body-14 text-text-gray-300">
            {metadata}
          </p>
        ) : null}
        <div className="mt-3">
          <CategoryBadge category={posting.category} />
        </div>
      </div>
    </button>
  );
}

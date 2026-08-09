import { ActivityListCard } from "@/features/activity/components/ActivityListCard";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import {
  formatVolunteerDate,
  formatVolunteerHomeDate,
  getRecruitmentDDay,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type {
  PostingListItem,
  VolunteerPostingListItem,
} from "@/features/volunteer/types/volunteer.types";

type VolunteerPostingCardProps = {
  posting: VolunteerPostingListItem | PostingListItem;
  onClick: () => void;
  variant?: "list" | "compact";
};

export function VolunteerPostingCard({
  posting,
  onClick,
  variant = "list",
}: VolunteerPostingCardProps) {
  const isUnifiedItem = "sourceType" in posting;
  const categories = isUnifiedItem ? posting.categories : [posting.category];
  const imageSrc =
    (isUnifiedItem ? posting.thumbnailUrl : null) ??
    getVolunteerPostingImage(categories[0], posting.id);
  const location = posting.regionName;
  const activityStartDate = isUnifiedItem
    ? (posting.activityStartAt?.slice(0, 10) ?? null)
    : posting.actStartDate;
  const activityDate =
    variant === "compact"
      ? formatVolunteerHomeDate(activityStartDate)
      : formatVolunteerDate(activityStartDate);
  const recruitmentDDay = getRecruitmentDDay(
    isUnifiedItem
      ? (posting.applyDeadlineAt?.slice(0, 10) ?? null)
      : posting.noticeEndDate,
  );
  const urgentRecruitmentDDay =
    recruitmentDDay === "D-day" || /^D-[1-7]$/.test(recruitmentDDay ?? "")
      ? recruitmentDDay
      : null;

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
    <ActivityListCard
      imageSrc={imageSrc}
      title={posting.title}
      description={
        isUnifiedItem ? posting.organizationName : posting.recruitOrg
      }
      metadata={[location, activityDate]}
      dDay={urgentRecruitmentDDay}
      categories={categories}
      onClick={onClick}
    />
  );
}

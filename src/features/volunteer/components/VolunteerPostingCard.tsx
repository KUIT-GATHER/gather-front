import { ActivityListCard } from "@/features/activity/components/ActivityListCard";
import {
  formatVolunteerDate,
  formatVolunteerHomeDate,
  getRecruitmentDDay,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type {
  PostingListItem,
  VolunteerPostingListItem,
} from "@/features/volunteer/types/volunteer.types";

import { VolunteerPostingCover } from "./VolunteerPostingCover";

type VolunteerPostingCardProps = {
  posting: VolunteerPostingListItem | PostingListItem;
  onClick: () => void;
  variant?: "list" | "compact";
  imageLoading?: "eager" | "lazy";
};

export function VolunteerPostingCard({
  posting,
  onClick,
  variant = "list",
  imageLoading,
}: VolunteerPostingCardProps) {
  const isUnifiedItem = "sourceType" in posting;
  const categories = isUnifiedItem ? posting.categories : [posting.category];
  const thumbnailUrl = isUnifiedItem ? posting.thumbnailUrl : null;
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
        <VolunteerPostingCover
          imageUrl={thumbnailUrl}
          category={categories[0]}
          postingId={posting.id}
          loading={imageLoading}
          className="aspect-square w-34 rounded-xl border border-stroke"
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
      image={
        <VolunteerPostingCover
          imageUrl={thumbnailUrl}
          category={categories[0]}
          postingId={posting.id}
          loading={imageLoading}
          className="h-[106px] w-[91px] shrink-0 rounded-[10px]"
        />
      }
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

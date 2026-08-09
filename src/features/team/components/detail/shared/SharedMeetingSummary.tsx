import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";

import { MeetingImageCarousel } from "./MeetingImageCarousel";

type SharedMeetingSummaryProps = {
  home: MeetingHome;
  detail: MeetingDetail;
  imageUrls: readonly string[];
};

export function SharedMeetingSummary({
  home,
  detail,
  imageUrls,
}: SharedMeetingSummaryProps) {
  return (
    <section>
      <MeetingImageCarousel meetingName={home.name} imageUrls={imageUrls} />
      <div className="flex flex-wrap gap-1">
        {detail.categories.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>
      {home.description ? (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-[28px] font-medium text-text">
          {home.description}
        </p>
      ) : null}
    </section>
  );
}

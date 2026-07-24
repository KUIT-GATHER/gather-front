import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";

type SharedMeetingSummaryProps = {
  home: MeetingHome;
  detail: MeetingDetail;
};

export function SharedMeetingSummary({
  home,
  detail,
}: SharedMeetingSummaryProps) {
  return (
    <section>
      <CategoryBadge category={detail.category} />

      {home.description ? (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-[28px] font-medium text-text">
          {home.description}
        </p>
      ) : null}
    </section>
  );
}

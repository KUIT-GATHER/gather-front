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
      <div className="-mx-5.5 -mt-4 mb-2.5 h-[184px] bg-stroke" aria-hidden="true" /> {/* 사진 추후 추가 예정 */}

      <CategoryBadge category={detail.category} />

      {home.description ? (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-[28px] font-medium text-text">
          {home.description}
        </p>
      ) : null}
    </section>
  );
}

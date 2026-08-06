import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { MeetingCover } from "@/features/team/components/MeetingCover";
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
      <MeetingCover
        meetingId={detail.meetingId}
        alt={home.name + " 대표 이미지"}
        className="-mx-5.5 -mt-4 mb-2.5 h-[184px]"
      />
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

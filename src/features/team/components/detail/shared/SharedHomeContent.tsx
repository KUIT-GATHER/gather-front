import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";

import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/detail/useVolunteerPostingDetail";

import { SharedMeetingConditionCard } from "./SharedMeetingConditionCard";
import { SharedMeetingInfoCard } from "./SharedMeetingInfoCard";
import { SharedMeetingMembersCard } from "./SharedMeetingMembersCard";
import { SharedMeetingSummary } from "./SharedMeetingSummary";
import { SharedUpcomingActivityCard } from "./SharedUpcomingActivityCard";

type SharedHomeContentProps = {
  home: MeetingHome;
  detail: MeetingDetail;
  imageUrls: readonly string[];
};

export function SharedHomeContent({
  home,
  detail,
  imageUrls,
}: SharedHomeContentProps) {
  const linkedPostingId =
    home.linkedPostingId ?? detail.volunteerPostingId ?? undefined;
  const linkedPostingQuery = useVolunteerPostingDetail(linkedPostingId);
  const linkedPosting = linkedPostingQuery.data;

  return (
    <div className="flex flex-col gap-4 px-5.5 py-4">
      <SharedMeetingSummary home={home} detail={detail} imageUrls={imageUrls} />
      <SharedMeetingInfoCard
        home={home}
        location={
          linkedPosting?.actPlace ??
          linkedPosting?.regionName ??
          home.regionName
        }
        linkedPostingTitle={
          home.linkedPostingTitle ?? linkedPosting?.title ?? null
        }
      />
      <SharedMeetingMembersCard members={home.members} />
      <SharedMeetingConditionCard
        participationCondition={home.participationCondition}
      />
      <SharedUpcomingActivityCard activity={home.upcomingActivity} />
    </div>
  );
}

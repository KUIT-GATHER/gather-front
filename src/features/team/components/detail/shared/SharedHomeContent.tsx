import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";

import { SharedMeetingConditionCard } from "./SharedMeetingConditionCard";
import { SharedMeetingInfoCard } from "./SharedMeetingInfoCard";
import { SharedMeetingMembersCard } from "./SharedMeetingMembersCard";
import { SharedMeetingSummary } from "./SharedMeetingSummary";
import { SharedUpcomingActivityCard } from "./SharedUpcomingActivityCard";

type SharedHomeContentProps = {
  home: MeetingHome;
  detail: MeetingDetail;
};

export function SharedHomeContent({ home, detail }: SharedHomeContentProps) {
  return (
    <div className="flex flex-col gap-4 px-5.5 py-4">
      <SharedMeetingSummary home={home} detail={detail} />
      <SharedMeetingInfoCard home={home} />
      <SharedMeetingMembersCard members={home.members} />
      <SharedMeetingConditionCard
        participationCondition={home.participationCondition}
      />
      <SharedUpcomingActivityCard activity={home.upcomingActivity} />
    </div>
  );
}

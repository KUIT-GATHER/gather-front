import type { VolunteerPostingMeeting } from "@/features/volunteer/types/volunteer.types";

import { VolunteerOpportunityTeamCard } from "./VolunteerOpportunityTeamCard";

type VolunteerPostingTeamCardProps = {
  meeting: VolunteerPostingMeeting;
  onClick: () => void;
};

function getMeetingActivityLabel(meeting: VolunteerPostingMeeting) {
  if (meeting.status === "COMPLETED") {
    return "활동 완료";
  }

  if (meeting.status === "CLOSED") {
    return "모집 마감";
  }

  return `${meeting.currentMemberCount}명 활동중`;
}

export function VolunteerPostingTeamCard({
  meeting,
  onClick,
}: VolunteerPostingTeamCardProps) {
  return (
    <VolunteerOpportunityTeamCard
      name={meeting.name}
      category={meeting.category}
      activityLabel={getMeetingActivityLabel(meeting)}
      onClick={onClick}
    />
  );
}

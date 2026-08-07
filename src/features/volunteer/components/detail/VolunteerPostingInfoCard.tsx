import {
  formatVolunteerPeriod,
  formatVolunteerTimeRange,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

import {
  VolunteerOpportunityInfoCard,
  type VolunteerOpportunityInfoRow,
} from "./VolunteerOpportunityInfoCard";

type VolunteerPostingInfoCardProps = {
  posting: VolunteerPosting;
  className?: string;
};

function getLocation(posting: VolunteerPosting) {
  return posting.locations[0]?.address ?? posting.actPlace;
}

function getParticipantCount(posting: VolunteerPosting) {
  if (posting.applicantCount === null && posting.recruitCount === null) {
    return null;
  }

  return `${posting.applicantCount ?? "-"}/${posting.recruitCount ?? "-"}명`;
}

function isInfoRow(
  row: VolunteerOpportunityInfoRow | null,
): row is VolunteerOpportunityInfoRow {
  return row !== null;
}

export function VolunteerPostingInfoCard({
  posting,
  className,
}: VolunteerPostingInfoCardProps) {
  const location = getLocation(posting);
  const activityPeriod = formatVolunteerPeriod(
    posting.actStartDate,
    posting.actEndDate,
  );
  const activityTime = formatVolunteerTimeRange(
    posting.actStartTime,
    posting.actEndTime,
  );
  const participantCount = getParticipantCount(posting);
  const recruitmentDeadline = formatVolunteerPeriod(
    posting.noticeEndDate,
    posting.noticeEndDate,
  );
  const rows = [
    location
      ? {
          id: "location",
          icon: "location" as const,
          label: "장소",
          value: location,
        }
      : null,
    activityPeriod
      ? {
          id: "date",
          icon: "date" as const,
          label: "날짜",
          value: activityPeriod,
        }
      : null,
    activityTime
      ? {
          id: "time",
          icon: "time" as const,
          label: "시간",
          value: activityTime,
        }
      : null,
    participantCount
      ? {
          id: "participants",
          icon: "participants" as const,
          label: "참여 인원",
          value: participantCount,
        }
      : null,
    recruitmentDeadline
      ? {
          id: "deadline",
          icon: "deadline" as const,
          label: "신청 마감",
          value: recruitmentDeadline,
        }
      : null,
    posting.recruitOrg
      ? {
          id: "volunteerOrganization",
          icon: "volunteerOrganization" as const,
          label: "봉사 기관명",
          value: posting.recruitOrg,
        }
      : null,
    posting.registerOrg
      ? {
          id: "portalOrganization",
          icon: "portalOrganization" as const,
          label: "포털 등록 기관명",
          value: posting.registerOrg,
        }
      : null,
  ].filter(isInfoRow);

  return <VolunteerOpportunityInfoCard rows={rows} className={className} />;
}

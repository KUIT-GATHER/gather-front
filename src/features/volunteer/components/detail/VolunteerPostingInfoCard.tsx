import {
  formatVolunteerPeriod,
  formatVolunteerTimeRange,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type {
  VolunteerPosting,
  VolunteerPostingSource,
} from "@/features/volunteer/types/volunteer.types";
import type { ReactNode } from "react";

import { VolunteerOpportunityInfoCard } from "./VolunteerOpportunityInfoCard";

type VolunteerPostingInfoCardProps = {
  posting: VolunteerPosting;
  className?: string;
};

const sourceLabelByValue: Record<VolunteerPostingSource, string> = {
  API_1365: "1365 자원봉사포털",
  VMS_CRAWL: "VMS",
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

function isInfoRow<T>(row: T | null): row is T {
  return row !== null;
}

function renderActivityTime(value: string): ReactNode {
  const match = /^(.*)\(([^()]+)\)$/.exec(value);

  if (!match) {
    return value;
  }

  const [, timeRange, duration] = match;

  return (
    <>
      {timeRange}(<span className="font-semibold text-button">{duration}</span>)
    </>
  );
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
          value: renderActivityTime(activityTime),
        }
      : null,
    location
      ? {
          id: "location",
          icon: "location" as const,
          label: "장소",
          value: location,
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
    {
      id: "portalOrganization",
      icon: "portalOrganization" as const,
      label: "포털 등록 기관명",
      value: sourceLabelByValue[posting.source],
    },
  ].filter(isInfoRow);

  return <VolunteerOpportunityInfoCard rows={rows} className={className} />;
}

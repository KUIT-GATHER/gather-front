import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

import { VolunteerOpportunityConditionCard } from "./VolunteerOpportunityConditionCard";

type VolunteerPostingConditionCardProps = {
  posting: VolunteerPosting;
  className?: string;
};

function getParticipationConditions(posting: VolunteerPosting) {
  const conditions = [];

  if (posting.isAdult) conditions.push("성인");
  if (posting.isTeen) conditions.push("청소년");
  if (posting.isGroup) conditions.push("단체");

  return conditions.length > 0
    ? `${conditions.join(" 및 ")} 신청 가능`
    : "별도 신청 조건 없음";
}

export function VolunteerPostingConditionCard({
  posting,
  className,
}: VolunteerPostingConditionCardProps) {
  return (
    <VolunteerOpportunityConditionCard
      condition={getParticipationConditions(posting)}
      className={className}
    />
  );
}

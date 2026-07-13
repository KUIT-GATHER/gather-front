import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

type VolunteerPostingConditionCardProps = {
  posting: VolunteerPosting;
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
}: VolunteerPostingConditionCardProps) {
  return (
    <section className="rounded-lg border border-stroke bg-white p-4">
      <h2 className="text-body-15-semibold text-text">참여 조건</h2>
      <p className="mt-2 text-body-14 text-text">
        · {getParticipationConditions(posting)}
      </p>
    </section>
  );
}

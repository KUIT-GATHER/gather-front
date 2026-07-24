type SharedMeetingConditionCardProps = {
  participationCondition: string | null;
};

export function SharedMeetingConditionCard({
  participationCondition,
}: SharedMeetingConditionCardProps) {
  return (
    <section className="rounded-lg border border-stroke bg-white p-4">
      <h2 className="text-[18px] leading-[28px] font-semibold text-text">
        활동 안내 및 참여 조건
      </h2>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-[21.125px] font-normal text-text">
        {participationCondition ?? "별도 참여 조건 없음"}
      </p>
    </section>
  );
}

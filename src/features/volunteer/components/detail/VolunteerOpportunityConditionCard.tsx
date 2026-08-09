import { cn } from "@/shared/lib/cn";

type VolunteerOpportunityConditionCardProps = {
  condition?: string;
  notice?: string;
  className?: string;
};

export function VolunteerOpportunityConditionCard({
  condition,
  notice,
  className,
}: VolunteerOpportunityConditionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-stroke bg-white p-[17px]",
        className,
      )}
    >
      <h2 className="text-title-18 text-text">참여 조건</h2>
      {notice ? (
        <p className="mt-2 whitespace-pre-line text-[15px] leading-[21px] font-normal text-point-red">
          {notice}
        </p>
      ) : null}
      {condition ? (
        <p className="mt-2 whitespace-pre-line text-[15px] leading-[21px] font-normal text-text">
          • {condition}
        </p>
      ) : null}
    </section>
  );
}

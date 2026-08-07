import { cn } from "@/shared/lib/cn";

type VolunteerOpportunityConditionCardProps = {
  condition: string;
  className?: string;
};

export function VolunteerOpportunityConditionCard({
  condition,
  className,
}: VolunteerOpportunityConditionCardProps) {
  return (
    <section
      className={cn("rounded-lg border border-stroke bg-white p-4", className)}
    >
      <h2 className="text-title-18 text-text">참여 조건</h2>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-6 font-normal text-text">
        · {condition}
      </p>
    </section>
  );
}

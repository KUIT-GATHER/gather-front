import { InfoIcon, type InfoIconName } from "@/shared/ui/InfoIcon";
import { cn } from "@/shared/lib/cn";

export type VolunteerOpportunityInfoIcon = InfoIconName;

export type VolunteerOpportunityInfoRow = {
  id: string;
  icon: VolunteerOpportunityInfoIcon;
  label: string;
  value: string;
};

type VolunteerOpportunityInfoCardProps = {
  rows: readonly VolunteerOpportunityInfoRow[];
  className?: string;
};

function DetailRow({ icon, label, value }: VolunteerOpportunityInfoRow) {
  return (
    <div className="grid grid-cols-[1.5rem_auto_1fr] items-start gap-x-3">
      <InfoIcon name={icon} />
      <dt className="whitespace-nowrap pt-0.5 text-[15px] leading-normal font-normal text-text-gray-400">
        {label}
      </dt>
      <dd className="pt-0.5 text-right text-[15px] leading-normal font-normal text-text">
        {value}
      </dd>
    </div>
  );
}

export function VolunteerOpportunityInfoCard({
  rows,
  className,
}: VolunteerOpportunityInfoCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-stroke bg-white px-3 py-4",
        className,
      )}
    >
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <DetailRow key={row.id} {...row} />
        ))}
      </dl>
    </section>
  );
}

import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

import { VolunteerPostingConditionCard } from "./VolunteerPostingConditionCard";
import { VolunteerOpportunityHero } from "./VolunteerOpportunityHero";
import { VolunteerPostingInfoCard } from "./VolunteerPostingInfoCard";

type VolunteerPostingHeroProps = {
  posting: VolunteerPosting;
};

export function VolunteerPostingHero({ posting }: VolunteerPostingHeroProps) {
  return (
    <VolunteerOpportunityHero
      title={posting.title}
      content={posting.content}
      imageSrc={getVolunteerPostingImage(posting.category, posting.id)}
      categories={[posting.category]}
      beforeContent={
        <>
          <VolunteerPostingInfoCard posting={posting} className="mt-4" />
          <VolunteerPostingConditionCard posting={posting} className="mt-6" />
        </>
      }
    />
  );
}

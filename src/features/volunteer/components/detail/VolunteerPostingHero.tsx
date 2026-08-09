import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

import { VolunteerOpportunityHero } from "./VolunteerOpportunityHero";

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
    />
  );
}

import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

type VolunteerPostingHeroProps = {
  posting: VolunteerPosting;
};

export function VolunteerPostingHero({ posting }: VolunteerPostingHeroProps) {
  return (
    <section>
      <div className="overflow-hidden rounded-lg">
        <img
          src={getVolunteerPostingImage(posting.category, posting.id)}
          alt=""
          className="aspect-[344/175] w-full object-cover"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <CategoryBadge category={posting.category} />
      </div>

      <p className="mt-2 whitespace-pre-line text-[15px] leading-[28px] font-medium text-text">
        {posting.content ?? "상세 설명이 제공되지 않았어요."}
      </p>
    </section>
  );
}

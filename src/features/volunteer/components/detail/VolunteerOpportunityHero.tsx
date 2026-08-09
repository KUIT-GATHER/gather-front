import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

type VolunteerOpportunityHeroProps = {
  title: string;
  content: string | null;
  imageSrc: string;
  imageAlt?: string;
  categories: readonly PostingCategory[];
  regionName?: string | null;
};

function Tag({ children }: { children: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-point-green/20 px-2.5 text-xs font-medium text-icon">
      {children}
    </span>
  );
}

export function VolunteerOpportunityHero({
  title,
  content,
  imageSrc,
  imageAlt = "",
  categories,
  regionName,
}: VolunteerOpportunityHeroProps) {
  return (
    <section>
      <div className="overflow-hidden rounded-[10px] border border-stroke">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="aspect-[36/19] w-full object-cover"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
        {regionName ? <Tag>{regionName}</Tag> : null}
      </div>

      <h2 className="mt-4 max-w-[306px] break-keep whitespace-pre-line text-[20px] leading-6 font-semibold text-text">
        {title}
      </h2>
      <p
        className={cn(
          "mt-3 whitespace-pre-line text-[15px] leading-7 font-medium text-text",
          !content && "text-text-gray-400",
        )}
      >
        {content ?? "상세 설명이 제공되지 않았어요."}
      </p>
    </section>
  );
}

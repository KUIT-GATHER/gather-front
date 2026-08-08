import type { ReactNode } from "react";

import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

type ActivityListCardProps = {
  imageSrc?: string;
  image?: ReactNode;
  title: string;
  description?: string | null;
  metadata: Array<string | null | undefined>;
  dDay?: string | null;
  categories: PostingCategory[];
  onClick: () => void;
};

export function ActivityListCard({
  imageSrc,
  image,
  title,
  description,
  metadata,
  dDay,
  categories,
  onClick,
}: ActivityListCardProps) {
  const details = metadata.filter(Boolean).join(" · ");
  const emphasized = dDay === "D-day" || /^D-[1-3]$/.test(dDay ?? "");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-[#c5c5c5] bg-white px-[11px] py-[15px] text-left transition-colors duration-200 hover:border-button hover:bg-[#f0f6f0] active:border-button active:bg-[#f0f6f0] focus:outline-none focus-visible:border-button focus-visible:bg-[#f0f6f0] focus-visible:ring-2 focus-visible:ring-button/30"
    >
      {image ?? (
        <img
          src={imageSrc}
          alt=""
          className="h-[106px] w-[91px] shrink-0 rounded-[10px] object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold leading-5 text-text">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 truncate text-[15px] leading-4 text-text-gray-400">
            {description}
          </p>
        ) : null}
        {details || dDay ? (
          <p className="mt-1 truncate text-sm leading-4 text-text-gray-400">
            {details}
            {dDay ? (
              <span
                className={cn("text-point-red", emphasized && "font-semibold")}
              >
                {details ? " · " : ""}
                {dDay}
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1">
          {categories.map((category) => (
            <CategoryBadge
              key={category}
              category={category}
              className="text-sm"
            />
          ))}
        </div>
      </div>
    </button>
  );
}

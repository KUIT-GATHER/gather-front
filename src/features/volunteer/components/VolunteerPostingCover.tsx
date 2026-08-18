import { useState } from "react";

import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingCoverProps = {
  imageUrl?: string | null;
  category?: PostingCategory | null;
  postingId?: number | null;
  alt?: string;
  className?: string;
};

export function VolunteerPostingCover({
  imageUrl,
  category,
  postingId,
  alt = "",
  className,
}: VolunteerPostingCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const fallbackSrc = getVolunteerPostingImage(category, postingId);
  const shouldShowRemote = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={shouldShowRemote && imageUrl ? imageUrl : fallbackSrc}
        alt={alt}
        className="size-full object-cover"
        onError={() => {
          if (shouldShowRemote && imageUrl) {
            setFailedUrl(imageUrl);
          }
        }}
      />
    </div>
  );
}

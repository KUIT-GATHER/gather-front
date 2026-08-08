import { useState } from "react";

import defaultMeetingImage from "@/features/team/assets/meeting-images/default-meeting-img.svg";
import { cn } from "@/shared/lib/cn";

type MeetingCoverProps = {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
};

export function MeetingCover({
  imageUrl,
  alt = "",
  className,
}: MeetingCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const shouldShowRemote = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={shouldShowRemote && imageUrl ? imageUrl : defaultMeetingImage}
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

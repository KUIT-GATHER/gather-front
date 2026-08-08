import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";
import defaultMeetingImage from "@/features/team/assets/meeting-images/default-meeting-img.svg";
import { cn } from "@/shared/lib/cn";

type MeetingCoverProps = {
  meetingId: number;
  alt?: string;
  className?: string;
};

export function MeetingCover({
  meetingId,
  alt = "",
  className,
}: MeetingCoverProps) {
  const imagesQuery = useQuery(teamQueries.images(meetingId));
  const imageUrl = imagesQuery.data?.imageUrls.find(Boolean);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={defaultMeetingImage}
        alt=""
        className="size-full object-cover"
      />
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          onError={(event) => event.currentTarget.remove()}
        />
      ) : null}
    </div>
  );
}

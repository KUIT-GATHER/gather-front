import { useMemo, useState } from "react";

import fallbackImage from "@/assets/images/fallback.png";

type MeetingImageCarouselProps = {
  meetingName: string;
  imageUrls: readonly string[];
};

type ImageErrorState = {
  imageKey: string;
  imageUrls: ReadonlySet<string>;
};

const EMPTY_FAILED_IMAGE_URLS: ReadonlySet<string> = new Set();

export function MeetingImageCarousel({
  meetingName,
  imageUrls,
}: MeetingImageCarouselProps) {
  const imageKey = imageUrls.join("\0");
  const [imageErrorState, setImageErrorState] = useState<ImageErrorState>({
    imageKey: "",
    imageUrls: new Set(),
  });
  const failedImageUrls =
    imageErrorState.imageKey === imageKey
      ? imageErrorState.imageUrls
      : EMPTY_FAILED_IMAGE_URLS;
  const availableImageUrls = useMemo(
    () =>
      imageUrls
        .slice(0, 1)
        .filter((imageUrl) => !failedImageUrls.has(imageUrl)),
    [failedImageUrls, imageUrls],
  );
  const primaryImageUrl = availableImageUrls[0];

  const handleImageError = (imageUrl: string) => {
    setImageErrorState((current) => {
      const currentFailedImageUrls =
        current.imageKey === imageKey ? current.imageUrls : new Set<string>();

      if (currentFailedImageUrls.has(imageUrl)) {
        return current;
      }

      return {
        imageKey,
        imageUrls: new Set([...currentFailedImageUrls, imageUrl]),
      };
    });
  };

  if (!primaryImageUrl) {
    return (
      <div className="-mx-5.5 -mt-4 mb-2.5 h-[184px] bg-stroke">
        <img
          src={fallbackImage}
          alt={`${meetingName} 모임 기본 이미지`}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="-mx-5.5 -mt-4 mb-2.5 h-[184px] overflow-hidden bg-stroke"
      aria-label={`${meetingName} 모임 이미지`}
    >
      <img
        src={primaryImageUrl}
        alt={`${meetingName} 모임 이미지`}
        className="h-[184px] w-full object-cover"
        onError={() => handleImageError(primaryImageUrl)}
      />
    </div>
  );
}

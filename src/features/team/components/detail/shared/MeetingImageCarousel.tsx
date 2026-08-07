import { useMemo, useState } from "react";

import fallbackImage from "@/assets/images/fallback.png";
import { useImageCarousel } from "@/features/team/hooks/useImageCarousel";
import { cn } from "@/shared/lib/cn";

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
    () => imageUrls.filter((imageUrl) => !failedImageUrls.has(imageUrl)),
    [failedImageUrls, imageUrls],
  );
  const {
    images,
    activeIndex,
    dragOffset,
    isDragging,
    hasMultipleImages,
    moveImage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useImageCarousel(availableImageUrls);

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

  if (images.length === 0) {
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
      <div
        className="relative h-full touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          className={cn(
            "flex h-full",
            !isDragging && "transition-transform duration-300 ease-out",
          )}
          style={{
            transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
          }}
        >
          {images.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={`${meetingName} 모임 이미지 ${index + 1}`}
              draggable={false}
              className="h-[184px] w-full shrink-0 object-cover"
              onError={() => handleImageError(imageUrl)}
            />
          ))}
        </div>

        {hasMultipleImages ? (
          <div
            className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2"
            aria-label={`${meetingName} 모임 이미지 페이지`}
          >
            {images.map((imageUrl, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={`${imageUrl}-indicator-${index}`}
                  type="button"
                  aria-label={`${index + 1}번째 이미지 보기`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "size-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                    isActive ? "bg-button" : "bg-bg/80",
                  )}
                  onClick={() => moveImage(index)}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

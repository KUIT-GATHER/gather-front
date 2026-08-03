import { useMemo, useRef, useState, type PointerEvent } from "react";

import { cn } from "@/shared/lib/cn";

const MAX_IMAGE_COUNT = 3;
const SWIPE_THRESHOLD = 48;
const SWIPE_START_THRESHOLD = 8;
const EMPTY_IMAGE_URLS: readonly string[] = [];

type SwipeDirection = "horizontal" | "vertical" | null;

type MeetingPostImageCarouselProps = {
  imageUrls?: readonly string[];
  title: string;
};

function clampIndex(index: number, imageCount: number) {
  return Math.min(Math.max(index, 0), imageCount - 1);
}

export function MeetingPostImageCarousel({
  imageUrls = EMPTY_IMAGE_URLS,
  title,
}: MeetingPostImageCarouselProps) {
  const images = useMemo(
    () => imageUrls.filter(Boolean).slice(0, MAX_IMAGE_COUNT),
    [imageUrls],
  );
  const imageKey = images.join("\0");
  const [activeImage, setActiveImage] = useState({
    imageKey: "",
    index: 0,
  });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gestureRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    direction: null as SwipeDirection,
  });

  const activeIndex =
    images.length > 0 && activeImage.imageKey === imageKey
      ? clampIndex(activeImage.index, images.length)
      : 0;

  if (images.length === 0) {
    return null;
  }

  const hasMultipleImages = images.length > 1;

  const moveImage = (nextIndex: number) => {
    setActiveImage({
      imageKey,
      index: clampIndex(nextIndex, images.length),
    });
  };

  const getDragOffset = (deltaX: number) => {
    const isDraggingPastFirst = activeIndex === 0 && deltaX > 0;
    const isDraggingPastLast = activeIndex === images.length - 1 && deltaX < 0;

    return isDraggingPastFirst || isDraggingPastLast ? deltaX * 0.25 : deltaX;
  };

  const finishGesture = (
    event: PointerEvent<HTMLDivElement>,
    wasCancelled = false,
  ) => {
    const gesture = gestureRef.current;

    if (gesture.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!wasCancelled && gesture.direction === "horizontal") {
      const deltaX = event.clientX - gesture.startX;

      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        moveImage(activeIndex + (deltaX < 0 ? 1 : -1));
      }
    }

    gesture.pointerId = null;
    gesture.direction = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div className="mt-5" aria-label="게시글 이미지">
      <div
        className="overflow-hidden rounded-xl border border-stroke bg-stroke touch-pan-y"
        onPointerDown={(event) => {
          if (!hasMultipleImages || event.button !== 0) {
            return;
          }

          gestureRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            direction: null,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          const gesture = gestureRef.current;

          if (gesture.pointerId !== event.pointerId) {
            return;
          }

          const deltaX = event.clientX - gesture.startX;
          const deltaY = event.clientY - gesture.startY;

          if (!gesture.direction) {
            if (Math.abs(deltaY) > Math.abs(deltaX) + SWIPE_START_THRESHOLD) {
              gesture.direction = "vertical";
              return;
            }

            if (Math.abs(deltaX) > SWIPE_START_THRESHOLD) {
              gesture.direction = "horizontal";
            }
          }

          if (gesture.direction !== "horizontal") {
            return;
          }

          setDragOffset(getDragOffset(deltaX));
        }}
        onPointerUp={finishGesture}
        onPointerCancel={(event) => finishGesture(event, true)}
      >
        <div
          className={cn(
            "flex",
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
              alt={`${title} 이미지 ${index + 1}`}
              draggable={false}
              className="aspect-[311/207] w-full shrink-0 object-cover"
            />
          ))}
        </div>
      </div>

      {hasMultipleImages ? (
        <div
          className="mt-2 flex items-center justify-center gap-2"
          aria-label="게시글 이미지 페이지"
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
                  isActive ? "bg-button" : "bg-stroke",
                )}
                onClick={() => moveImage(index)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

import { useMemo, useRef, useState, type PointerEvent } from "react";

const MAX_IMAGE_COUNT = 3;
const SWIPE_THRESHOLD = 48;
const SWIPE_START_THRESHOLD = 8;
const EMPTY_IMAGE_URLS: readonly string[] = [];

type SwipeDirection = "horizontal" | "vertical" | null;

function clampIndex(index: number, imageCount: number) {
  return Math.min(Math.max(index, 0), imageCount - 1);
}

export function useImageCarousel(
  imageUrls: readonly string[] = EMPTY_IMAGE_URLS,
) {
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
    event: PointerEvent<HTMLElement>,
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

  return {
    images,
    activeIndex,
    dragOffset,
    isDragging,
    hasMultipleImages,
    moveImage,
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
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
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
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
    },
    onPointerUp: finishGesture,
    onPointerCancel: (event: PointerEvent<HTMLElement>) =>
      finishGesture(event, true),
  };
}
